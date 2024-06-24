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

    if (request.action === 'recommendations') {
      const vanillaRecommendationsIds =
        await fetchRecommendationsRelatedToVideoId(request.currentVideoId);

      const vanillaCategoryPromises = vanillaRecommendationsIds[0].result.map(
        async (vanillaVideoId) => {
          const vanillaCategoryId = await fetchVideoCategories(
            vanillaVideoId,
            headers
          );
          return { vanillaVideoId, vanillaCategoryId };
        }
      );

      const categoryPromises = request.videoIds.map(async (videoId) => {
        const categoryId = await fetchVideoCategories(videoId, headers);
        return { videoId, categoryId };
      });

      const vanillaVideoCategories = await Promise.all(vanillaCategoryPromises);
      const videoCategories = await Promise.all(categoryPromises);

      await storeRecommendations(vanillaVideoCategories, videoCategories);
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

// Fetch the video categories by its ID
async function fetchVideoCategories(videoId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`,
    'GET',
    headers
  );
  const data = await result.json();
  return data.items[0].snippet.categoryId;
}

async function fetchRecommendationsRelatedToVideoId(videoId) {
  return new Promise((resolve, reject) => {
    chrome.windows.create(
      {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        incognito: true,
        focused: false,
        type: 'popup',
        state: 'minimized',
      },
      (window) => {
        setTimeout(() => {
          const tabId = window.tabs[0].id;
          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              func: extractRecommendations,
            },
            (results) => {
              if (chrome.runtime.lastError) {
                chrome.windows.remove(window.id);
                return reject(chrome.runtime.lastError);
              }
              chrome.windows.remove(window.id);
              resolve(results);
            }
          );
        }, 5000);
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

// Store recommendations to local storage
async function storeRecommendations(
  generalRecommendations,
  customRecommendations
) {
  chrome.storage.local.get(['GeneralRecommendations']).then((result) => {
    let data = result.recommendations || [];
    data.push(generalRecommendations);
    chrome.storage.local.set({ GeneralRecommendations: data }).then(() => {
      console.log('Random recommendations saved', data);
    });
  });

  chrome.storage.local.get(['CustomRecommendations']).then((result) => {
    let data = result.recommendations || [];
    data.push(customRecommendations);
    chrome.storage.local.set({ CustomRecommendations: data }).then(() => {
      console.log('Custom recommendations saved', data);
    });
  });

  return true;
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
      return handleNotInterested(videoId, type, headers);
    case 'cancelAction':
      return handleCancel(videoId, type, headers);
    case 'retrieveThumbnail':
      if (type === 'video') {
        return fetchVideoThumbnail(videoId, headers);
      }
  }
}

// Manage 'Not Interessed' actions
async function handleNotInterested(videoId, type, headers) {
  const promises = [
    sendNotInterested(videoId, headers),
    sendDontRecommendChannel(videoId, headers),
    //sendDislike(videoId, headers),
  ];

  if (type === 'video') {
    promises.push(sendRemoveFromHistory(videoId, headers));
  }

  return await Promise.all(promises);
}

// Manage 'Cancel' actions
async function handleCancel(videoId, type, headers) {
  const promises = [
    cancelNotInterested(videoId, headers),
    cancelDontRecommendChannel(videoId, headers),
    //cancelDislike(videoId, headers),
  ];

  if (type === 'video') {
    promises.push(cancelRemoveFromHistory(videoId, headers));
  }

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
  return result;
}

// Function to cancel a 'Dislike' signal
async function cancelDislike(videoId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=none`,
    'POST',
    headers
  );
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
