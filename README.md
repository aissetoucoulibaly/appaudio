# Les petites aventures — alpha familiale

Application Expo pour un premier essai accompagné, à 4 ans. Deux histoires originales intégrées (pompiers et police), personnages récurrents, texte complet, autorisation parentale avant narration, favoris locaux et voix du téléphone.

**Cette version ne génère pas encore d’histoires par IA.** Aucun compte, abonnement, clé API, prénom réel ou service analytique. Aucun envoi applicatif de récit à un fournisseur ; la synthèse vocale dépend des services système et de leurs réglages.

## Démarrer

Node.js 24 et npm. Depuis ce dépôt :

```sh
npm ci
npm start
```

Installer Expo Go sur l’iPhone avec une version compatible SDK 58, connecter téléphone et ordinateur au même réseau, puis scanner le QR code affiché. Aucun compte Apple Developer payant n’est nécessaire pour Expo Go. La disponibilité de cette version dans Expo Go sur votre iPhone reste à vérifier. Un serveur cloud non accessible depuis le téléphone ne suffit pas : privilégier le lancement sur votre ordinateur. Ne pas exposer publiquement Metro.

```sh
npm run web
```

Le mode web sert à inspecter le parcours et peut utiliser la synthèse vocale du navigateur. Les comportements iPhone ne sont pas déduits du test web.

## Essai familial

1. Choisir un récit, lire le texte en entier.
2. Résoudre le calcul parental et autoriser le récit.
3. Lancer la lecture, essayer pause et reprise. La reprise recommence au début du paragraphe.
4. Tester les favoris, fermer et rouvrir l’app : favoris et autorisations doivent rester.
5. Quitter l’application : la voix s’arrête et l’espace parent se verrouille.
6. Depuis l’espace parent, effacer les choix locaux et vérifier qu’une nouvelle autorisation est nécessaire.

Sur iPhone, désactiver le mode silencieux et vérifier le volume. Les voix disponibles et leur qualité dépendent du système ; des ressources vocales peuvent devoir être téléchargées. La durée affichée est estimée et non mesurée sur un fichier.

**Non fourni / non validé :** génération IA, fichier audio téléchargeable, commandes écran verrouillé, lecture de fond, publication App Store. Un vrai build iOS et des essais sur appareil seront nécessaires pour la prochaine étape audio. TestFlight nécessitera un abonnement Apple Developer ; un build local avec signature gratuite est parfois possible sur Mac, avec limitations.

## Vérifications

```sh
npm run typecheck
npm run lint
npm run export:web
npm run test:e2e
```

Les tests navigateur utilisent Chromium (chemin configurable avec `CHROMIUM_PATH`, par défaut `/usr/bin/chromium`). Ils contrôlent l’autorisation préalable, la reprise de lecture avec synthèse vocale simulée, la persistance, la remise à zéro et les filtres. Ils ne valident ni la qualité de la voix ni le comportement natif iPhone. Les tests sur appareil restent manuels. Aucun récit généré ne devra devenir accessible à l’enfant avant relecture parentale dans les prochaines versions.

## Suite proposée

- Mesurer l’intérêt pour les deux univers, le rythme et la réécoute.
- Backend serveur pour la génération encadrée (jamais de clé dans le bundle mobile), budgets, validation et annulation.
- Narration TTS sous contrat, fichiers privés, lecteur natif audio et tests de fond sur iPhone.
- Compte développeur et TestFlight une fois ces fonctions prêtes à tester.
