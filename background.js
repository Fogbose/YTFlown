// Listen content script messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.identity.getAuthToken({ interactive: true }, async (token) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting auth token:', chrome.runtime.lastError);
      sendResponse({
        action: 'actionFailed',
        error: chrome.runtime.lastError.message,
      });
      return;
    }

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    headers.append('Content-type', 'application/json');

    try {
      const result = await sendYTSignal(
        request.videoId,
        request.action,
        request.type,
        headers
      );
      sendResponse({ action: 'actionCompleted', result });
    } catch (error) {
      console.error('Error sending signals:', error);
      sendResponse({
        action: 'actionFailed',
        error: error.message,
      });
    }
  });

  return true;
});

// Function to send an request to YouTube Data API v3
async function sendYTRequest(url, headers) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.log('Error in sendYTRequest:', error);
    throw error;
  }
}

// Send a signal to YouTube Data API v3 according to action and type request
async function sendYTSignal(videoId, action, type, headers) {
  try {
    if (action === 'notInterested') {
      return await handleNotInterestedAction(videoId, type, headers);
    } else if (action === 'cancelAction') {
      return await handleCancelAction(videoId, type, headers);
    } else if (action === 'retrieveThumbnail') {
      if (type === 'video') {
        return await getVideoThumbnail(videoId, headers);
      }
    }
  } catch (error) {
    console.error('Error in SendYTSignal:', error);
    throw error;
  }
}

// Manage 'Not Interessed' actions
async function handleNotInterestedAction(videoId, type, headers) {
  const promises = [
    sendNotInterestedSignal(videoId, headers),
    sendDontRecommendChannelSignal(videoId, headers),
    //sendDislikeSignal(videoId, headers),
  ];

  if (type === 'video') {
    promises.push(sendRemoveFromHistorySignal(videoId, headers));
  }

  return await Promise.all(promises);
}

// Manage 'Cancel' actions
async function handleCancelAction(videoId, type, headers) {
  const promises = [
    cancelNotInterestedSignal(videoId, headers),
    cancelDontRecommendChannelSignal(videoId, headers),
    //cancelDislikeSignal(videoId, headers),
  ];

  if (type === 'video') {
    promises.push(cancelRemoveFromHistorySignal(videoId, headers));
  }

  return await Promise.all(promises);
}

// Function to send a 'Not Interested' signal
async function sendNotInterestedSignal(videoId, headers) {
  return Promise.resolve({ message: "'Not Interested' signal sent" });
}

// Function to cancel a 'Not Interested' signal
async function cancelNotInterestedSignal(videoId, headers) {
  return Promise.resolve({ message: "'Not Interested' signal cancelled" });
}

// Function to send a 'Dont Recommend Channel' signal
async function sendDontRecommendChannelSignal(videoId, headers) {
  return Promise.resolve({ message: "'Don't Recommend Channel' signal sent" });
}

// Function to cancel a 'Dont recommend Channel' signal
async function cancelDontRecommendChannelSignal(videoId, headers) {
  return Promise.resolve({
    message: "'Don't Recommend Channel' signal cancelled",
  });
}

// Function to send a 'Dislike' signal
async function sendDislikeSignal(videoId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=dislike`,
    headers
  );
  return result;
}

// Function to cancel a 'Dislike' signal
async function cancelDislikeSignal(videoId, headers) {
  const result = await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=none`,
    headers
  );
  return result;
}

// Function to send a 'Remove From History' signal
async function sendRemoveFromHistorySignal(videoId, headers) {
  return Promise.resolve({ message: "'Remove From History' signal sent" });
}

// Function to cancel a 'Remove From History' signal
async function cancelRemoveFromHistorySignal(videoId, headers) {
  return Promise.resolve({ message: "'Remove From History' signal cancelled" });
}

// /!\ DEPRECATED - Due to low access to API /!\ Function to get a video thumbnail
async function getVideoThumbnail(videoId, headers) {
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
