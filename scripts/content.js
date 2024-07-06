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
  return new URL(thumbnail.querySelector('a').href).searchParams.get('v');
}

// Get the image source for thumbnail of a video
function getThumbnailImgSrc(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

//**************************************************************************** */

// Function to create and return a 'Not Interested' button
function createNotInterestedButton(className, clickHandler, isActivated) {
  const button = document.createElement('button');
  button.className = `not-interested-button ${className}`;
  button.style.display = isActivated ? 'none' : 'flex';
  button.setAttribute('arial-label', 'Pas Intéressé');

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'not-interested-container';

  const icon = document.createElement('img');
  const src = isActivated
    ? 'assets/images/dash-circle-fill.svg'
    : 'assets/images/dash-circle.svg';
  icon.className = isActivated ? 'activate' : 'deactivate';
  try {
    icon.src = chrome.runtime.getURL(src);
  } catch (error) {
    console.error('Error loading image:', error);
  }
  icon.alt = 'Pas Intéressé';

  const textParagraph = document.createElement('span');
  textParagraph.textContent = 'Pas Intéressé';
  textParagraph.className = 'not-interested-text';

  buttonContainer.appendChild(icon);
  buttonContainer.appendChild(textParagraph);

  button.appendChild(buttonContainer);

  button.addEventListener('click', clickHandler);

  return button;
}

// Create the message to background script
function createMessageToBackground(action, type, videoId, feedback) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        source: 'content',
        action: action,
        type: type,
        videoId,
      },
      (response) => {
        if (response.action === 'actionComleted') {
          console.log(response.result);
          resolve(feedback ? feedback() : response.result);
        } else if (response.action === 'actionFailed') {
          reject(response.error || 'Failed: Error in feedback process');
        }
      }
    );
  });
}

// Function to create and return a feeback banner to 'Not Interested' action
function createFeedbackBanner(className, thumbnailImgSrc, clickHandler) {
  const banner = document.createElement('div');
  banner.className = `feedback-banner ${className}`;
  banner.style.display = 'none';
  banner.setAttribute('role', 'alert');

  const bannerPrimaryContainer = document.createElement('div');
  bannerPrimaryContainer.className = 'banner-primary-container';

  const img = document.createElement('img');
  img.src = thumbnailImgSrc;
  img.alt = 'Thumbnail';

  const textButton = document.createElement('div');
  textButton.className = 'text-button-container';

  const text = document.createElement('span');
  text.textContent = 'Vous receverez moins de contenus similaire.';

  const button = document.createElement('button');
  button.className = 'cancel-action-button';
  button.textContent = 'Cancel';
  button.addEventListener('click', clickHandler);
  button.setAttribute('aria-label', 'Cancel action');

  textButton.appendChild(text);
  textButton.appendChild(button);

  bannerPrimaryContainer.appendChild(img);
  bannerPrimaryContainer.appendChild(textButton);

  banner.appendChild(bannerPrimaryContainer);

  return banner;
}

//**************************************************************************** */

// Function to add 'Not Interested' button to engagement panel
function addButtonToEngagementPannel() {
  const engagementPannel = getEngagementPanel();

  const existingButtons = engagementPannel.querySelectorAll(
    '.not-interested-button'
  );
  existingButtons.forEach((button) => button.remove());

  const deactivatedButton = createNotInterestedButton(
    'engagement-pannel',
    () =>
      createMessageToBackground(
        'notInterested',
        'video',
        getCurrentVideoId(),
        toggleEngagementPannel()
      ),
    false
  );

  const activatedButton = createNotInterestedButton(
    'engagement-pannel',
    () =>
      createMessageToBackground(
        'cancelAction',
        'video',
        getCurrentVideoId(),
        toggleEngagementPannel()
      ),
    true
  );

  // Update the number of childs specified as attribute in parent node
  var currentNumItems = parseInt(
    engagementPannel.getAttribute('has-items'),
    10
  );
  engagementPannel.setAttribute('has-items', currentNumItems + 2);

  engagementPannel.prepend(activatedButton);
  engagementPannel.prepend(deactivatedButton);
}

// Function to add 'Not Interested' button to thumbnails
function addButtonToThumbnail(thumbnail) {
  const existingButton = thumbnail.querySelector('.not-interested-button');
  if (existingButton) existingButton.remove();

  const menuButton = thumbnail.querySelector('#menu > ytd-menu-renderer');
  if (menuButton) menuButton.remove();

  const button = createNotInterestedButton('thumbnail', () =>
    createMessageToBackground(
      'notInterested',
      'recommendation',
      getThumbnailVideoId(thumbnail),
      toggleThumbnailWithBanner(thumbnail),
      'flex',
      false
    )
  );

  button.querySelector('span').style.display = 'none';

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = 'Pas intéressé';

  // Add mouseover event to show tooltip
  button.addEventListener('mouseover', (event) => {
    const rect = button.getBoundingClientRect();
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  });

  // Add mousemove event to update tooltip position
  button.addEventListener('mousemove', (event) => {
    const rect = button.getBoundingClientRect();
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
  });

  // Add mouseout event to hide tooltip
  button.addEventListener('mouseout', () => {
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
  });

  // Append button and tooltip to the thumbnail
  thumbnail.appendChild(button);
  document.body.appendChild(tooltip);
}

// Function to add feedback banner under engagement pannel
function addFeebackBannerUnderEngagementPannel() {
  const middleRow = getMiddleRow();

  const existingBanner = middleRow.querySelector('.feedback-banner');
  if (existingBanner) existingBanner.remove();

  const banner = createFeedbackBanner(
    'middle-row',
    getThumbnailImgSrc(getCurrentVideoId())
  );

  banner.querySelector('button').style.display = 'none';

  middleRow.appendChild(banner);
}

// Function to add feedback banner to thumbnails
function addFeedbackBannerToThumbnail(thumbnail) {
  const existingBanner = thumbnail.parentNode.querySelector('.feedback-banner');
  if (existingBanner) existingBanner.remove();

  const banner = createFeedbackBanner(
    'thumbnail-banner',
    getThumbnailImgSrc(getThumbnailVideoId(thumbnail)),
    () =>
      createMessageToBackground(
        'cancelAction',
        'recommendation',
        getThumbnailVideoId(thumbnail),
        toggleThumbnailWithBanner(thumbnail)
      )
  );

  thumbnail.parentNode.appendChild(banner);
}

//**************************************************************************** */

// Toggle the Engagement Pannel with information banner
function toggleEngagementPannel() {
  toggleEngagementPannelButton();
  toggleEngagementPannelBanner();
}

// Toggle the Engagement Pannel 'Not Interested' Button
function toggleEngagementPannelButton() {
  const buttons = getEngagementPanel().querySelectorAll(
    '.not-interested-button'
  );

  buttons.forEach((button) => {
    button.style.display = button.style.display === 'none' ? 'flex' : 'none';
  });
}

// Toggle the Engagement Pannel Banner
function toggleEngagementPannelBanner() {
  const banner = getMiddleRow().querySelector('.feedback-banner');
  const deactivateButton = getEngagementPanel()
    .querySelector('.deactivate')
    .closest('button');

  const isActivated = deactivateButton.style.display === 'none';

  banner.style.display = isActivated ? 'flex' : 'none';
}

// Toggle the Icon of the button
function toggleIcon(button) {
  const deactivateIcon = button.querySelector('img.deactivate');
  const activateIcon = button.querySelector('img.activate');

  if (deactivateIcon.style.display === 'none') {
    deactivateIcon.style.display = 'flex';
    activateIcon.style.display = 'none';
  } else {
    deactivateIcon.style.display = 'none';
    activateIcon.style.display = 'flex';
  }

  return deactivateIcon.style.display === 'none';
}

// Toggle between thumbnail and feedback banner
function toggleThumbnailWithBanner(thumbnail) {
  const banner = thumbnail.parentNode.querySelector('.feedback-banner');

  if (!banner) return;

  if (banner.style.display === 'none') {
    thumbnail.style.display = 'none';
    banner.style.display = 'flex';
  } else {
    thumbnail.removeAttribute('style');
    banner.style.display = 'none';
  }
}

//**************************************************************************** */

// Callback function for MutationObserver
function onPageChange(mutationList, observer) {
  for (let mutation of mutationList) {
    // Reaction to node modification
    if (mutation.type === 'attributes') {
      if (
        mutation.attributeName === 'href' &&
        mutation.target.closest('#player') &&
        getEngagementPanel() != null
      ) {
        addFeebackBannerUnderEngagementPannel();
        addButtonToEngagementPannel();
      }
      if (
        mutation.attributeName === 'href' &&
        mutation.target.closest('ytd-compact-video-renderer')
      ) {
        mutation.target.closest(
          'ytd-compact-video-renderer > #dismissible'
        ).style.display = 'flex';
        addButtonToThumbnail(
          mutation.target.closest('ytd-compact-video-renderer > #dismissible')
        );
        addFeedbackBannerToThumbnail(
          mutation.target.closest('ytd-compact-video-renderer > #dismissible')
        );
      }
    }
  }
}

// Mutation Observer configuration to interact with YouTube SPA
// in order to react to dynamic DOM events
// due to YouTube SPA model.
document.addEventListener('yt-navigate-finish', process);

function process() {
  const targetNode = document.getElementById('page-manager');

  const observerConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    attributesFilter: ['href'],
  };
  const observer = new MutationObserver(onPageChange);
  observer.observe(targetNode, observerConfig);
}

//**************************************************************************** */
