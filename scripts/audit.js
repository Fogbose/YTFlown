(function () {
  let processedRVLengths = new Set();

  function startObserving() {
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

      if (
        recommendedVideos.length % 20 === 0 &&
        !processedRVLengths.has(recommendedVideos.length)
      ) {
        processedRVLengths.add(recommendedVideos.length);
        chrome.runtime.sendMessage({
          source: 'audit',
          action: 'recommendations',
          currentVideoId: currentVideoId,
          videoIds: recommendedVideos.slice(-20),
          videoCount: recommendedVideos.length,
        });
      }
    });

    const targetNode = document.getElementById('page-manager');
    const observerConfig = {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    };
    observer.observe(targetNode, observerConfig);
  }

  // Attendre 2 secondes avant de démarrer l'observation
  setTimeout(startObserving, 2000);
})();
