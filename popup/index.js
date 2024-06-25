document.addEventListener('DOMContentLoaded', function () {
  var exportDataButton = document.getElementById('exportData');
  var resetStorageButton = document.getElementById('resetStorage');

  exportDataButton.addEventListener('click', function () {
    chrome.storage.local
      .get([
        'GeneralRecommendations',
        'CustomRecommendations',
        'NotInterestedVideos',
      ])
      .then((data) => {
        var jsonData = JSON.stringify(data);
        var blob = new Blob([jsonData], { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        // Create a link to download file
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'extension_data.json';
        document.body.appendChild(a);

        // Download the file;
        a.click();

        // Clear link
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  });

  resetStorageButton.addEventListener('click', function () {
    // Reset local storage
    chrome.storage.local.clear(function () {
      console.log('Local storage has been reset.');
    });
  });
});
