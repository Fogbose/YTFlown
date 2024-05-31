chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == 'notInterested') {
    const videoId = request.videoId;

    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      headers.append('Content-type', 'application/json');

      sendYTSignal(videoId, request.type, headers);
    });
  }
});

function sendYTSignal(videoId, type, headers) {
  if (type === 'video') {
    sendNotInterestedSignal(videoId, headers);
    sendDontRecommendChannelSignal(videoId, headers);
    sendDislikeSignal(videoId, headers);
    sendRemoveFromHistorySignal(videoId, headers);
  } else if (type === 'recommendation') {
    sendNotInterestedSignal(videoId, headers);
    sendDontRecommendChannelSignal(videoId, headers);
    sendDislikeSignal(videoId, headers);
  }
}

function sendYTRequest(url, headers) {
  fetch(url, {
    method: 'POST',
    headers: headers,
  })
    .then((response) => {
      // DEPRECATED MUST TELL CONTENT.JS THAT IT'S DONE TO UPDATE FRONTEND
      console.log(response);
    })
    .catch((error) => console.error('Error:', error));
}

function sendNotInterestedSignal(videoId, headers) {
  console.log(`Sending 'Not Interested' signal for video ${videoId}`);
}

function sendDontRecommendChannelSignal(videoId, headers) {
  console.log(`Sending 'Don't Recommend Channel' signal for video ${videoId}`);
}

function sendDislikeSignal(videoId, headers) {
  sendYTRequest(
    `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=dislike`,
    headers
  );
  console.log(`Sending 'Dislike' signal for video ${videoId}`);
}

function sendRemoveFromHistorySignal(videoId, headers) {
  console.log(`Sending 'Remove From History' signal for video ${videoId}`);
}
