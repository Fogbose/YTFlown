// Mutation Observer Configuration for 'watch next' recommandations
// section
// /!\ Placed at front of the script to avoid late initialisation of
// the observer /!\
var targetNode = document.body;
var config = { childList: true, subtree: true };

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

// Function to add 'Not Interested' button to thumbnails
function addButtonToThumbnails() {
  const thumbnails = document.querySelectorAll('#dismissible');

  thumbnails.forEach((thumbnail) => {
    if (thumbnail.querySelector('.not-interested-button')) return;

    const button = createNotInterestedButton('thumbnail', () => {
      alert('Button clicked');
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
      alert('Vidéo marquée comme pas intéressée !');
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
  observer.observe(targetNode, config);
}

// Initialize button addition for engagement panel
function initializeEngagementPannelButton() {
  waitForDOMElement('#menu > ytd-menu-renderer', (element) => {
    addButtonToEngagementPannel(element);
  });
}

initializeMutationObserver();
initializeEngagementPannelButton();
