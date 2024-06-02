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

// Function to configure the click handler
function configureClickHandler(action, type) {
  const videoId = getCurrentVideoId();
  chrome.runtime.sendMessage(
    {
      action: action,
      type: type,
      videoId,
    },
    (response) => {
      if (response.action === 'actionCompleted') {
        console.log(`Call action in response to {videoId}`);
      } else if (response.action === 'actionFailed') {
        console.log(`Failed: Error in feedback process for {videoId}.`);
      }
    }
  );
}

// Function to add 'Not Interested' button to engagement panel
function addButtonToEngagementPannel(engagementPannel) {
  const button = createNotInterestedButton('engagement-pannel', () =>
    configureClickHandler('notInterested', 'video')
  );

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

// Function to add 'Not Interested' button to thumbnails
function addButtonToThumbnail(thumbnail) {
  if (thumbnail.querySelector('.not-interested-button')) return;

  const button = createNotInterestedButton('thumbnail', () =>
    configureClickHandler('notInterested', 'recommendation')
  );

  thumbnail.appendChild(button);
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

// Get the id of the current page's video
function getCurrentVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Callback function for MutationObserver
function onPageChange(mutationList, observer) {
  for (let mutation of mutationList) {
    if (mutation.type === 'childList' || mutation.type === 'subtree') {
      // Reaction to node creation
      mutation.addedNodes.forEach((addedNode) => {
        // Creation of 'Not interested' button to engagement pannel
        // while available.
        if (
          addedNode.nodeType === Node.ELEMENT_NODE &&
          addedNode.matches('#menu > ytd-menu-renderer') &&
          addedNode.closest('#below > ytd-watch-metadata') &&
          !addedNode.closest('#middle-row > ytd-info-panel-content-renderer')
        ) {
          addButtonToEngagementPannel(addedNode);
        }
      });

      // Reaction to node deletation
      mutation.removedNodes.forEach((removedNode) => {
        if (
          removedNode.nodeType === Node.ELEMENT_NODE &&
          removedNode.matches('#menu > ytd-menu-renderer') &&
          addedNode.closest('#below > ytd-watch-metadata')
        ) {
          console.log('ah oui ?');
        }
      });
    }
    // Reaction to node modification
    else if (mutation.type === 'attributes') {
      if (
        mutation.attributeName === 'href' &&
        mutation.target.closest('ytd-compact-video-renderer')
      ) {
        addButtonToThumbnail(
          mutation.target.closest('ytd-compact-video-renderer')
        );
      }
    }
  }
}

// Mutation Observer configuration to interact with YouTube SPA
// in order to react to dynamic DOM events
// due to YouTube SPA model.
const observerConfig = {
  childList: true,
  subtree: true,
  attributes: true,
  attributesFilter: ['href'],
};
const targetNode = document.getElementById('page-manager');
const observer = new MutationObserver(onPageChange);
observer.observe(targetNode, observerConfig);
