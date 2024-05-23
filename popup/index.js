document.getElementById('extract').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: extractVideoIDs,
      },
      (results) => {
        const videoIDs = results[0].result;
        document.getElementById('video-ids').innerText = videoIDs.join('\n');
      }
    );
  });
});

function extractVideoIDs() {
  const videoElements = document.querySelectorAll('a#thumbnail');
  const videoIDs = Array.from(videoElements)
    .map((el) => {
      const url = new URL(el.href);
      return url.searchParams.get('v');
    })
    .filter((id) => id);
  return videoIDs;
}
