// Function to create and return a 'Not Interested' button
function createNotInterestedButton(className, clickHandler) {
  const button = document.createElement('button');
  button.className = `not-interested-button ${className}`;

  const deactivateIcon = document.createElement('img');
  deactivateIcon.className = 'deactivate';
  deactivateIcon.src = chrome.runtime.getURL('assets/images/dash-circle.svg');
  deactivateIcon.alt = 'Not Interested';
  deactivateIcon.style.display = 'block';

  const activateIcon = document.createElement('img');
  activateIcon.className = 'activate';
  activateIcon.src = chrome.runtime.getURL(
    'assets/images/dash-circle-fill.svg'
  );
  activateIcon.alt = 'Not Interested';
  activateIcon.style.display = 'none';

  button.appendChild(deactivateIcon);
  button.appendChild(activateIcon);
  button.addEventListener('click', clickHandler);

  return button;
}

// Function to add 'Not Interested' button to engagement panel
function addButtonToEngagementPannel(engagementPannel) {
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
          createEngagementPannelFeedback(engagementPannel);
        } else if (response.action === 'actionFailed') {
          console.log(`Failed: Error in feedback process for {videoId}.`);
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

// Function to add 'Not Interested' button to thumbnails
function addButtonToThumbnail(thumbnail) {
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
          createThumbnailFeedback(thumbnail);
        } else if (response.action === 'actionFailed') {
          console.log(`Failed: Error in feedback process for {videoId}.`);
        }
      }
    );
  });

  thumbnail.appendChild(button);
}

// Creation of the engagement pannel feedback following user action
function createEngagementPannelFeedback(engagementPannel) {
  toggleIcon(engagementPannel.querySelector('ytd-menu-renderer > button'));
  addFeebackBannerUnderEngagementPannel(
    engagementPannel.closest('#below > ytd-watch-metadata')
  );
}

// Creation of thumbnail feedback following user action
function createThumbnailFeedback(thumbnail) {
  replaceThumbnailWithFeedbackBanner(thumbnail);
}

// Toggle the Icon of the button
function toggleIcon(button) {
  const deactivateIcon = button.querySelector('img.deactivate');
  const activateIcon = button.querySelector('img.activate');

  if (deactivateIcon.style.display === 'none') {
    deactivateIcon.style.display = 'block';
    activateIcon.style.display = 'none';
  } else {
    deactivateIcon.style.display = 'none';
    activateIcon.style.display = 'block';
  }
}

function addFeebackBannerUnderEngagementPannel(infoBox) {
  const middleRow = infoBox.querySelector('#middle-row');

  const banner = document.createElement('div');
  banner.className = 'feedback-banner';
  //const thumbnailImgSrc = thumbnail.querySelector('img').src;
  //const videoId = infobox.querySelector('a').href.split('=')[1];

  banner.innerHTML = `
      <div class="text-button-container">
        <p>You will receive less similar content.</p>
        <button class="cancel-action-button">Cancel</button>
      </div>
    `;

  middleRow.appendChild(banner);
}

// Function to replace a thumbnail element with a feedback banner
function replaceThumbnailWithFeedbackBanner(thumbnail) {
  const banner = document.createElement('div');
  banner.className = 'feedback-banner';
  const thumbnailImgSrc = thumbnail.querySelector('img').src;
  const videoId = thumbnail.querySelector('a').href.split('=')[1];

  banner.innerHTML = `
      <img src="${thumbnailImgSrc}" alt="Thumbnail">
      <div class="text-button-container">
        <p>You will receive less similar content.</p>
        <button class="cancel-action-button">Cancel</button>
      </div>
    `;

  const cancelButton = banner.querySelector('.cancel-action-button');
  cancelButton.addEventListener('click', () => {
    chrome.runtime.sendMessage(
      {
        action: 'cancelAction',
        type: 'recommendation',
        videoId,
      },
      (response) => {
        if (response.action === 'actionCompleted') {
          console.log(`Cancelled 'not interested' signal for video ${videoId}`);
          banner.parentNode.replaceChild(thumbnail, banner);
        } else if (response.action === 'actionFailed') {
          console.log(
            `Cancelled 'not interested' signal failed for video ${videoId}`
          );
        }
      }
    );
  });

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
          mutation.target.closest('ytd-compact-video-renderer > #dismissible')
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
