// Fonction pour simuler le clic sur le bouton "Not interested"
function simulateNotInterestedClick() {
  // Trouver le bouton de menu de la vidéo
  const menuButton = document.querySelector(
    '#button-shape > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill'
  );
  if (!menuButton) {
    console.error('Bouton de menu non trouvé');
    return;
  }

  // Simuler un clic sur le bouton de menu
  menuButton.click();

  // Attendre que le menu apparaisse et trouver le bouton "Not interested"
  const observer = new MutationObserver(() => {
    const notInterestedButton = document.querySelector(
      '#items > ytd-menu-service-item-renderer:nth-child(2) > tp-yt-paper-item'
    );

    if (notInterestedButton) {
      // Simuler un clic sur le bouton "Not interested"
      notInterestedButton.click();
      observer.disconnect();
    }
  });

  observer.observe(document, { childList: true, subtree: true });
}

setTimeout(simulateNotInterestedClick, 5000);
