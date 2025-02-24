# YTFlown

## Introduction
Bienvenue dans le guide officiel pour l'extension Chrome "Feedback Précis pour un Algorithme Précis" ! Cette extension a été conçue dans le cadre d'un projet universitaire pour améliorer l'expérience utilisateur sur YouTube en permettant aux utilisateurs de signaler des erreurs dans leur flux de recommandations.

Cette solution vise à offrir un meilleur contrôle aux utilisateurs sur leurs recommandations et à explorer comment ces retours influencent l'algorithme. Le projet s'appuie sur des recherches approfondies sur la théorie des bulles de filtres, la diversité de contenu et l'interaction utilisateur avec les systèmes de recommandation.

---

## Fonctionnalités principales

- **Signalement d'erreurs :** Permettre aux utilisateurs d'indiquer les recommandations jugées inappropriées ou non pertinentes.
- **Annulation du signalement d'erreur :** Permettre aux utilisateurs d'annuler leur signalement.
- **Capture des données de tests :** Capture automatique des données d'interaction utilisateur et de diversité de contenu.
- **Sauvegarder les données des tests :** Sauvegarde des données receuillies en local.
- **Réinitialiser les données pour de nouveaux tests :** Réinitialisation des données de l'extension pour mener un nouveau test.

---

## Installation

1. **Prérequis :**
   - Navigateur Google Chrome (version 88 ou supérieure).
   - Accès à GitHub pour télécharger les fichiers source.

2. **Téléchargement de l'extension :**
   - Clonez ou téléchargez ce dépôt GitHub :
     ```bash
     git clone https://github.com/username/repository-name.git
     ```

3. **Chargement dans Chrome :**
   - Ouvrez Chrome et accédez à `chrome://extensions/`.
   - Activez le mode "Développeur" (coin supérieur droit).
   - Cliquez sur "Charger l'extension non empaquetée" et sélectionnez le dossier contenant le projet.

4. **Utilisation :**
   - Une fois installée, l'extension sera disponible dans la barre d'outils Chrome.

---

## Fonctionnement technique

### Technologies utilisées
- **HTML/CSS/JavaScript :** Pour l'interface utilisateur.
- **Chrome Extension API :** Pour l'intégration avec le navigateur et les actions sur les pages.
- **Local Storage :** Pour conserver les données utilisateur localement.

### Architecture
1. **Manifest.json :**
   - Contient les métadonnées essentielles de l'extension.
   - Définit les permissions et les scripts utilisés.

2. **Scripts principaux :**
   - `background.js` : Gestion des processus en arrière-plan.
   - `content.js` : Interaction avec les éléments de la page YouTube.
   - `popup.js` : Contrôle de l'interface utilisateur.

3. **Permissions :**
   - Lecture et modification des pages YouTube.
   - Stockage local pour les données utilisateur.

---

## Contribuer

1. **Fork et clonez le dépôt :**
   ```bash
   git clone https://github.com/Fogbose/YTFlown.git
   ```

2. **Créez une branche :**
   ```bash
   git checkout -b feature/nom-de-la-fonctionnalite
   ```

3. **Envoyez vos modifications :**
   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```

4. **Soumettez une Pull Request.**

---

## Auteur

Simon Polet, Université de Namur, Année Académique 2023-2024

---

## Licence
Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus d'informations.

---

## Ressources visuelles
![image](https://github.com/user-attachments/assets/777f67e8-4a75-42ac-b87b-748caccc7fb2)
![image](https://github.com/user-attachments/assets/45789ab2-52ce-433a-82f9-000169175cd2)
![image](https://github.com/user-attachments/assets/263f9b5e-3c28-49e2-81ec-29c049ea9872)

---

## Contact
Pour toute question ou assistance, contactez :
- Email : simon.polet@protonmail.com
- GitHub : [Fogbose](https://github.com/Fogbose)

