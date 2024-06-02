// Function to create and return a 'Not Interested' button
function createNotInterestedButton(className, clickHandler) {
  const button = document.createElement('button');
  button.className = `not-interested-button ${className}`;

  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL('assets/images/dash-circle.svg');
  icon.alt = 'Not Interested';

  button.appendChild(icon);
  button.addEventListener('click', clickHandler);

  return button;
}

// Function to replace a thumbnail element with a feedback banner
function replaceThumbnailWithFeedbackBanner(thumbnail, button) {
  const banner = document.createElement('div');
  banner.className = 'feedback-banner';
  const thumbnailImgSrc = thumbnail.querySelector('img').src;

  banner.innerHTML = `
    <img src="${thumbnailImgSrc}" alt="Thumbnail">
    <p>You will receive less similar content.</p>
    <button class="cancel-action-button">Cancel</button>
  `;

  /**
  const cancelButton = banneer.querySelector('.cancel-action-button');
  cancelButton.addEventListener('click', () => {
    chrome.runtime.sendMessage(
      {
        action: 'cancelAction',
        type: 'recommandation',
        videoId,
      },
      (response) => {
        if (response.action === 'cancelCompleted') {
          console.log(`Cancelled action for video ${videoId}`);
          thumbnail.innerHTML = originalThumbnailContent;
        } else if (response.action === 'cancelFailed') {
          console.log(`Cancel action failed for video ${videoId}`);
        }
      }
    );
  });
  */

  thumbnail.parentNode.replaceChild(banner, thumbnail);
}

// Function to add 'Not Interested' button to thumbnails
function addButtonToThumbnails() {
  const thumbnails = document.querySelectorAll('#dismissible');

  thumbnails.forEach((thumbnail) => {
    if (thumbnail.querySelector('.not-interested-button')) return;

    const button = createNotInterestedButton('thumbnail', () => {
      const videoId = thumbnail.querySelector('a').href.split('=')[1];
      chrome.runtime.sendMessage(
        {
          action: 'notInterested',
          type: 'recommendation',
          videoId,
        },
        (response) => {
          if (response.action === 'actionCompleted') {
            replaceThumbnailWithFeedbackBanner(thumbnail, button);
          } else if (response.action === 'actionFailed') {
            console.log(`Engagement pannel for video {videoId} failed`);
          }
        }
      );
    });

    thumbnail.appendChild(button);
  });
}

// Function to add 'Not Interested' button to engagement panel
function addButtonToEngagementPannel(engagementPannel) {
  if (
    engagementPannel &&
    !engagementPannel.querySelector('.not-interested-button.engagement-pannel')
  ) {
    const button = createNotInterestedButton('engagement-pannel', () => {
      const videoId = getCurrentVideoId();
      chrome.runtime.sendMessage(
        {
          action: 'notInterested',
          type: 'video',
          videoId,
        },
        (response) => {
          if (response.action === 'actionCompleted') {
            console.log(`Engagement pannel for video {videoId}`);
          } else if (response.action === 'actionFailed') {
            console.log(`Engagement pannel for video {videoId} failed`);
          }
        }
      );
    });

    const textParagraph = document.createElement('p');
    textParagraph.textContent = 'Not Interested';

    button.appendChild(textParagraph);

    // Update the number of childs specified as attribute in parent node
    var currentNumItems = parseInt(
      engagementPannel.getAttribute('has-items'),
      10
    );
    engagementPannel.setAttribute('has-items', currentNumItems + 1);

    engagementPannel.prepend(button);
  }
}

function getCurrentVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Utility function to wait for a DOM element and then execute a callback
function waitForDOMElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  } else {
    setTimeout(() => waitForDOMElement(selector, callback), 100);
  }
}

// Initialize MutationObserver for thumbnails
function initializeMutationObserver() {
  const observer = new MutationObserver(addButtonToThumbnails);
  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize button addition for engagement panel
function initializeEngagementPannelButton() {
  waitForDOMElement('#menu > ytd-menu-renderer', (element) => {
    addButtonToEngagementPannel(element);
  });
}

initializeMutationObserver();
initializeEngagementPannelButton();
