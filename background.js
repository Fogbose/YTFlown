// Liste for web navigation events on YouTube
chrome.webNavigation.onHistoryStateUpdated.addListener(
  function (details) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ['/scripts/audit.js'],
    });
  },
  { url: [{ hostSuffix: 'youtube.com', pathPrefix: '/watch' }] }
);

// Listen for messages from content and audit scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.source == 'content') {
    handleContentMessage(request, sender, sendResponse);
  } else if (request.source == 'audit') {
    handleAuditMessage(request, sender, sendResponse);
  }
  return true;
});

// Manage content script message
async function handleContentMessage(request, sender, sendResponse) {
  try {
    const token = await fetchAuthToken();
    const headers = createAuthHeaders(token);

    const result = await processYTAction(
      request.videoId,
      request.action,
      request.type,
      headers
    );
    sendResponse({ action: 'actionCompleted', result });
  } catch (error) {
    console.error('Error in manageContentMessage:', error);
    sendResponse({
      action: 'actionFailed',
      error: error.message,
    });
  }
}

// Manage audit script message
async function handleAuditMessage(request, sender, sendResponse) {
  try {
    const token = await fetchAuthToken();
    const headers = createAuthHeaders(token);

    const currentVideoId = request.currentVideoId;

    if (request.action === 'recommendations') {
      if (request.videoCount <= 20) {
        const vanillaRecommendationsIds =
          await fetchRecommendationsRelatedToVideoId(request.currentVideoId);

        const vanillaCategoryPromises = vanillaRecommendationsIds.map(
          async (videoId) => {
            const categoryId = await fetchVideoCategories(videoId, headers);
            return { videoId, categoryId };
          }
        );

        const vanillaVideoCategories = await Promise.all(
          vanillaCategoryPromises
        );

        await storeRecommendations(
          'GeneralRecommendations',
          currentVideoId,
          vanillaVideoCategories
        );
      }

      const categoryPromises = request.videoIds.map(async (videoId) => {
        const categoryId = await fetchVideoCategories(videoId, headers);
        return { videoId, categoryId };
      });

      const videoCategories = await Promise.all(categoryPromises);

      await storeRecommendations(
        'CustomRecommendations',
        currentVideoId,
        videoCategories
      );

      sendResponse({ action: 'actionCompleted' });
    }
  } catch (error) {
    console.error('Error in manageAuditMessage:', error);
    sendResponse({
      action: 'actionFailed',
      error: error.message,
    });
  }
}

// Get authentication token
function fetchAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

// Create headers with auth token
function createAuthHeaders(token) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);
  headers.append('Content-type', 'application/json');
  return headers;
}

// Fetch the video data by its ID
async function fetchVideoData(videoId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`,
    'GET',
    headers
  );
  return await result.json();
}

// Fetch the video categories by its ID
async function fetchVideoCategories(videoId, headers) {
  const data = await fetchVideoData(videoId, headers);
  return data.items[0].snippet.categoryId;
}

async function fetchYTVideoByCategory(categoryId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${categoryId}&maxResults=4&regionCode=BE&relevanceLanguage=fr`,
    'GET',
    headers
  );
  return await result.json();
}

async function fetchRecommendationsRelatedToVideoId(videoId) {
  return new Promise((resolve, reject) => {
    chrome.windows.create(
      {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        incognito: true,
        focused: false,
        type: 'panel',
        left: -1000,
        top: -1000,
        width: 1,
        height: 1,
      },
      (window) => {
        const checkRecommendations = setInterval(() => {
          chrome.scripting.executeScript(
            {
              target: { tabId: window.tabs[0].id },
              func: extractRecommendations,
            },
            (results) => {
              if (chrome.runtime.lastError) {
                clearInterval(checkRecommendations);
                chrome.windows.remove(window.id);
                reject(chrome.runtime.lastError);
                return;
              }

              const recommendedURLs = results[0].result;

              if (recommendedURLs.length >= 20) {
                clearInterval(checkRecommendations);
                chrome.windows.remove(window.id);
                resolve(recommendedURLs.slice(0, 20));
              }
            }
          );
        }, 1000);
      }
    );
  });
}

function extractRecommendations() {
  const recommendationElements = Array.from(
    document.querySelectorAll(
      '#items > ytd-compact-video-renderer > #dismissible'
    )
  );

  const recommendedURL = recommendationElements.map((element) =>
    new URL(element.querySelector('a').href).searchParams.get('v')
  );

  return recommendedURL;
}

async function storeNotInterestedAction(videoId, relatedVideosIds, headers) {
  const categoryId = await fetchVideoCategories(videoId, headers);
  const videoIdsDict = { [videoId]: relatedVideosIds };

  chrome.storage.local.get(['NotInterestedVideos']).then((result) => {
    let notInterestedVideos = result.NotInterestedVideos || [];
    notInterestedVideos.push({ videoIdsDict, categoryId });
    chrome.storage.local
      .set({ NotInterestedVideos: notInterestedVideos })
      .then(() => {
        console.log('Not Interested Videos saved', notInterestedVideos);
      });
  });

  return true;
}

async function deleteNotInterestedAction(videoId, headers) {
  const categoryId = await fetchVideoCategories(videoId, headers);

  chrome.storage.local.get(['NotInterestedVideos']).then((result) => {
    let notInterestedVideos = result.NotInterestedVideos || [];
    notInterestedVideos = notInterestedVideos.filter(
      (item) =>
        !(videoId in item.videoIdsDict) || item.categoryId !== categoryId
    );
    chrome.storage.local
      .set({ NotInterestedVideos: notInterestedVideos })
      .then(() => {
        console.log('Not Interested Videos deleted', notInterestedVideos);
      });
  });

  return true;
}

// Store recommendations to local storage
async function storeRecommendations(
  label,
  currentVideoId,
  videosWithCategories
) {
  try {
    const result = await chrome.storage.local.get([label]);
    let data = result[label] || [];
    let videoIdData = data.find(
      (item) => item.currentVideoId === currentVideoId
    );

    if (videoIdData) {
      videoIdData.recommendations.push(...videosWithCategories);
    } else {
      data.push({
        currentVideoId: currentVideoId,
        recommendations: videosWithCategories,
      });
    }

    await chrome.storage.local.set({ [label]: data });
    console.log('Recommendations saved', data);

    return true;
  } catch (error) {
    console.error('Error storing recommendations:', error);
    return false;
  }
}

// Send a request to YouTube Data API v3
async function sendYTRequest(url, method, headers) {
  const response = await fetch(url, { method, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response;
}

// Process a YouTube Action
async function processYTAction(videoId, action, type, headers) {
  switch (action) {
    case 'notInterested':
      return handleNotInterested(videoId, headers);
    case 'cancelAction':
      return handleCancel(videoId, headers);
    case 'retrieveThumbnail':
      if (type === 'video') {
        return fetchVideoThumbnail(videoId, headers);
      }
  }
}

// Manage 'Not Interessed' actions
async function handleNotInterested(videoId, headers) {
  const categoryId = await fetchVideoCategories(videoId, headers);
  const relatedVideosIds = (
    await fetchYTVideoByCategory(categoryId, headers)
  ).items.map((item) => item.id.videoId);

  const promises = [
    sendDislike(videoId, headers),
    ...relatedVideosIds.map((id) => sendDislike(id, headers)),
  ];

  await storeNotInterestedAction(videoId, relatedVideosIds, headers);

  return await Promise.all(promises);
}

// Manage 'Cancel' actions
async function handleCancel(videoId, headers) {
  const categoryId = await fetchVideoCategories(videoId, headers);

  const notInterestedVideos = await chrome.storage.local.get([
    'NotInterestedVideos',
  ]);

  relatedVideoIds = Array.from(notInterestedVideos).find(
    (item) => videoId in item.videoIdsDict && item.categoryId === categoryId
  );

  if (relatedVideoIds) {
    relatedVideoIds = relatedVideoIds.videoIdsDict[videoId];
  } else {
    relatedVideoIds = [];
  }

  await deleteNotInterestedAction(videoId, headers);
  const promises = [
    cancelDislike(videoId, headers),
    ...relatedVideoIds.map((id) => cancelDislike(id, headers)),
  ];

  return await Promise.all(promises);
}

// Function to send a 'Not Interested' signal
async function sendNotInterested(videoId, headers) {
  return Promise.resolve({ message: "'Not Interested' signal sent" });
}

// Function to cancel a 'Not Interested' signal
async function cancelNotInterested(videoId, headers) {
  return Promise.resolve({ message: "'Not Interested' signal cancelled" });
}

// Function to send a 'Dont Recommend Channel' signal
async function sendDontRecommendChannel(videoId, headers) {
  return Promise.resolve({ message: "'Don't Recommend Channel' signal sent" });
}

// Function to cancel a 'Dont recommend Channel' signal
async function cancelDontRecommendChannel(videoId, headers) {
  return Promise.resolve({
    message: "'Don't Recommend Channel' signal cancelled",
  });
}

// Function to send a 'Dislike' signal
async function sendDislike(videoId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=dislike`,
    'POST',
    headers
  );
  console.log(`Feedback Sent : ${videoId}`);
  return result;
}

// Function to cancel a 'Dislike' signal
async function cancelDislike(videoId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=none`,
    'POST',
    headers
  );
  console.log(`Feedback Cancelled : ${videoId}`);
  return result;
}

// Function to send a 'Remove From History' signal
async function sendRemoveFromHistory(videoId, headers) {
  return Promise.resolve({ message: "'Remove From History' signal sent" });
}

// Function to cancel a 'Remove From History' signal
async function cancelRemoveFromHistory(videoId, headers) {
  return Promise.resolve({ message: "'Remove From History' signal cancelled" });
}

// /!\ DEPRECATED - Due to low access to API /!\ Function to get a video thumbnail
async function fetchVideoThumbnail(videoId, headers) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`;
  try {
    const response = await fetch(apiUrl, headers);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const thumbnailUrl = data.items[0].snippet.thumbnails.high.url;
      console.log(`Thumbnail URL for video ${videoId}: ${thumbnailUrl}`);
      return { thumbnailUrl };
    } else {
      console.log(`No data found for video ${videoId}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch video thumbnail: ${error}`);
    return null;
  }
}
