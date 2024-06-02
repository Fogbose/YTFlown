chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == 'notInterested') {
    const videoId = request.videoId;

    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      headers.append('Content-type', 'application/json');

      try {
        await sendYTSignal(videoId, request.type, headers);
        sendResponse({ action: 'actionCompleted' });
      } catch (error) {
        console.error('Error sending signals:', error);
        sendResponse({
          action: 'actionFailed',
          error: error.message,
        });
      }
    });

    return true;
  }
});

async function sendYTSignal(videoId, type, headers) {
  if (type === 'video') {
    await sendNotInterestedSignal(videoId, headers);
    await sendDontRecommendChannelSignal(videoId, headers);
    //await sendDislikeSignal(videoId, headers);
    await sendRemoveFromHistorySignal(videoId, headers);
  } else if (type === 'recommendation') {
    await sendNotInterestedSignal(videoId, headers);
    await sendDontRecommendChannelSignal(videoId, headers);
    //await sendDislikeSignal(videoId, headers);
  }
}

async function sendYTRequest(url, headers) {
  fetch(url, {
    method: 'POST',
    headers: headers,
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error('Error:', error));
}

async function sendNotInterestedSignal(videoId, headers) {
  console.log(`Sending 'Not Interested' signal for video ${videoId}`);
}

async function sendDontRecommendChannelSignal(videoId, headers) {
  console.log(`Sending 'Don't Recommend Channel' signal for video ${videoId}`);
}

async function sendDislikeSignal(videoId, headers) {
  await sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=dislike`,
    headers
  );
  console.log(`Sending 'Dislike' signal for video ${videoId}`);
}

async function sendRemoveFromHistorySignal(videoId, headers) {
  console.log(`Sending 'Remove From History' signal for video ${videoId}`);
}
