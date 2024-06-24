(function () {
  const observer = new MutationObserver(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentVideoId = urlParams.get('v');

    const recommendedVideos = Array.from(
      document.querySelectorAll('#contents > ytd-compact-video-renderer')
    )
      .map((thumbnail) => {
        const url = new URL(thumbnail.querySelector('a').href);
        return url.searchParams.get('v');
      })
      .filter(Boolean);

    if (recommendedVideos.length === 20) {
      chrome.runtime.sendMessage({
        source: 'audit',
        action: 'recommendations',
        currentVideoId: currentVideoId,
        videoIds: recommendedVideos,
      });

      observer.disconnect();
    }
  });

  const targetNode = document.getElementById('page-manager');
  const observerConfig = { subtree: true, childList: true };
  observer.observe(targetNode, observerConfig);
})();
