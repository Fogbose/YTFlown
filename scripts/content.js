//**************************************************************************** */

// Function to get the info box under a video
function getInfoBox() {
  return document.querySelector('#below > ytd-watch-metadata');
}

// Function to get the middle Row of the info box under a video
function getMiddleRow() {
  return getInfoBox().querySelector('#middle-row');
}

// Function to get the engagement pannel node
function getEngagementPanel() {
  return document.querySelector(
    '#below > ytd-watch-metadata #menu > ytd-menu-renderer:not(#middle-row ytd-info-panel-content-renderer #menu > ytd-menu-renderer)'
  );
}

//**************************************************************************** */

// Get the id of the current page's video
function getCurrentVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Get the id of the video for a thumbnail
function getThumbnailVideoId(thumbnail) {
  return thumbnail.querySelector('a').href.split('=')[1];
}

//**************************************************************************** */

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

  const textParagraph = document.createElement('p');
  textParagraph.textContent = 'Not Interested';
  textParagraph.style.display = 'block';

  button.appendChild(deactivateIcon);
  button.appendChild(activateIcon);
  button.appendChild(textParagraph);
  button.addEventListener('click', clickHandler);

  return button;
}

// Create the message to background script
function createMessageToBackground(action, type, videoId, feedback) {
  chrome.runtime.sendMessage(
    {
      action: action,
      type: type,
      videoId,
    },
    (response) => {
      if (response.action === 'actionComleted') {
        feedback();
      } else if (response.action === 'actionFailed') {
        console.log('Failed: Error in feedback process.');
      }
    }
  );
}

// Function to create and return a feeback banner to 'Not Interested' action
function createFeedbackBanner(className, thumbnailImgSrc, clickHandler) {
  const banner = document.createElement('div');
  banner.className = `feedback-banner ${className}`;

  const img = document.createElement('img');
  img.src = thumbnailImgSrc;
  img.alt = 'Thumbnail';

  const textButton = document.createElement('div');
  textButton.className = 'text-button-container';

  const text = document.createElement('p');
  text.textContent = 'You will receive less similar content.';

  const button = document.createElement('Button');
  button.className = 'cancel-action-button';
  button.textContent = 'Cancel';
  button.addEventListener('click', clickHandler);

  textButton.appendChild(text);
  textButton.appendChild(button);

  banner.appendChild(img);
  banner.appendChild(textButton);

  return banner;
}

//**************************************************************************** */

// Function to add 'Not Interested' button to engagement panel
function addButtonToEngagementPannel() {
  const engagementPannel = getEngagementPanel();

  const button = createNotInterestedButton('engagement-pannel', () =>
    createMessageToBackground(
      'notInterested',
      'video',
      getCurrentVideoId(),
      createEngagementPannelFeedback(engagementPannel)
    )
  );

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
    createMessageToBackground(
      'notInterested',
      'recommendation',
      getThumbnailVideoId(thumbnail),
      createThumbnailFeedback(thumbnail)
    )
  );

  button.querySelector('p').style.display = 'none';

  thumbnail.appendChild(button);
}

//**************************************************************************** */

// Creation of the engagement pannel feedback following user action
function createEngagementPannelFeedback() {
  toggleIcon(getEngagementPanel().querySelector('ytd-menu-renderer > button'));
  addFeebackBannerUnderEngagementPannel(getInfoBox());
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

// Function to replace a thumbnail element with a feedback banner
function replaceThumbnailWithFeedbackBanner(thumbnail) {
  const banner = createFeedbackBanner(
    'thumbnail-banner',
    thumbnail.querySelector('img').src,
    () =>
      createMessageToBackground(
        'cancelAction',
        'recommendation',
        getThumbnailVideoId(thumbnail),
        banner.parentNode.replaceChild(thumbnail, banner)
      )
  );

  thumbnail.parentNode.replaceChild(banner, thumbnail);
}

// Callback function for MutationObserver
function onPageChange(mutationList, observer) {
  for (let mutation of mutationList) {
    if (mutation.type === 'childList' || mutation.type === 'subtree') {
      // Reaction to node creation
      mutation.addedNodes.forEach((addedNode) => {
        if (
          addedNode.nodeType === Node.ELEMENT_NODE &&
          addedNode.matches('#menu > ytd-menu-renderer') &&
          addedNode.closest('#below > ytd-watch-metadata') &&
          !addedNode.closest('#middle-row > ytd-info-panel-content-renderer')
        ) {
          // Creation of 'Not interested' button to engagement pannel
          // while available.
          addButtonToEngagementPannel();
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
