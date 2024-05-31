chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == 'notInterested') {
    const videoId = request.videoId;
    sendYouTubeSignal(videoId, request.type);
  }
});

function sendYouTubeSignal(videoId, type) {
  if (type === 'video') {
    sendNotInterestedSignal(videoId);
    sendDontRecommendChannelSignal(videoId);
    sendDislikeSignal(videoId);
    sendRemoveFromHistorySignal(videoId);
  } else if (type === 'recommendation') {
    sendNotInterestedSignal(videoId);
    sendDontRecommendChannelSignal(videoId);
    sendDislikeSignal(videoId);
  }
}

function sendNotInterestedSignal(videoId) {
  console.log(`Sending 'Not Interested' signal for video ${videoId}`);
}

function sendDontRecommendChannelSignal(videoId) {
  console.log(`Sending 'Don't Recommend Channel' signal for video ${videoId}`);
}

function sendDislikeSignal(videoId) {
  console.log(`Sending 'Dislike' signal for video ${videoId}`);
}

function sendRemoveFromHistorySignal(videoId) {
  console.log(`Sending 'Remove From History' signal for video ${videoId}`);
}
