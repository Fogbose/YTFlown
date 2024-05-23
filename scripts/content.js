function getRecommendedVideoIDs() {
  const recommendedVideos = document.querySelectorAll(
    'a#thumbnail[href*="watch"]'
  );
  let videoIDs = [];

  recommendedVideos.forEach((video) => {
    const url = new URL(video.href);
    const videoID = url.searchParams.get('v');
    if (videoID) {
      videoIDs.push(videoID);
    }
  });

  return videoIDs;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoIDs') {
    const videoIDs = getRecommendedVideoIDs();
    console.log(videoIDs);
    sendResponse({ videoIDs: videoIDs });
  }
});
