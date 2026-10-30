# Les petites aventures — alpha familiale

Application Expo pour un essai accompagné, à 4 ans. Deux histoires originales intégrées (pompiers et police), personnages récurrents, prénom du héros, jusqu’à trois amis facultatifs, ambiance musicale originale réglable, voix françaises de l’appareil et autorisation parentale avant narration.

**Édition du soir 0.3 :** nouvelle interface ivoire/indigo, typographie éditoriale et onglet Imaginer. Les demandes du soir peuvent être préparées avec des boutons et un détail libre facultatif, puis sauvegardées sur l’appareil. La création de nouveaux récits passe par un serveur familial à configurer ; elle reste indisponible sans compte API, modèle et tarifs renseignés. Voir [le guide du service familial](server/README.md). Un abonnement Claude ou ChatGPT ne suffit pas pour accéder à leurs API.

Les histoires créées sont sauvegardées dans la bibliothèque et restent bloquées avant relecture parentale. Elles utilisent encore la voix du téléphone. La chaîne Anthropic et OpenAI est testée avec des fournisseurs simulés, pas avec un compte API réel.

**Sans connexion au service familial, cette version ne génère pas de nouvelle histoire par IA.** Les deux trames sont adaptées localement : le prénom remplace le personnage principal et les amis choisis participent à une introduction et une conclusion communes. Aucun compte, abonnement, clé API ou service analytique. Les prénoms restent dans le stockage local de l’app (non chiffré par l’application). Pour les récits intégrés, aucun envoi applicatif de récit à un fournisseur ; la synthèse vocale dépend des services système et de leurs réglages. Effacer les données locales dans l’espace parent efface aussi les prénoms, idées et histoires créées de cet appareil, sans effacer les éventuelles copies serveur.

## Personnalisation et son

Dans **Espace parent**, enregistrer le prénom et les amis (séparés par des virgules), choisir une voix française disponible, essayer la prononciation, régler ou désactiver la musique. Dans un récit, choisir les amis qui participent, ou « Sans les amis ». Toute modification du texte annule l’autorisation précédente. Relire le texte personnalisé avant de l’autoriser.

La musique est une nappe harmonique synthétisée originale de 24 secondes en boucle. Aucun échantillon tiers. Source reproductible : `python scripts/make-ambience.py`. Elle s’arrête avec la voix. Mélange voix/musique à vérifier sur le véritable iPhone, ainsi que les interruptions. Aucun accès au microphone n’est demandé par le projet.

### Diagnostic musique — 0.2.1

Le bloc « Musique douce » affiche « Version musique 0.2.1 ». Le bouton « Écouter la musique seule (6 secondes) » joue un extrait sans narration, au niveau sélectionné, sans sauvegarde préalable. Il peut être arrêté immédiatement. Pour le récit, choisir « Avec musique », le niveau souhaité, puis enregistrer la personnalisation. La piste utilise désormais des notes plus audibles sur le haut-parleur du téléphone et une attaque courte ; la session audio est explicitement activée avant le récit. La correction doit encore être confirmée sur un véritable iPhone.

Un test navigateur décode et lit réellement le WAV et vérifie la progression du temps, contrairement aux tests de coordination voix/musique qui simulent la lecture. Aucun de ces tests ne garantit le volume perçu ou le mixage sur iOS.

Le budget de 5 € (ou 10 € maximum) est pour l’instant une préférence locale pour le futur service. **Ce n’est pas un contrôle de facturation serveur.** Aucun appel payant n’est effectué. L’activation future exigera des tarifs vérifiés, une réservation de budget atomique côté serveur, un plafond fournisseur, un consentement au transfert des prénoms et un stockage audio permettant la réécoute sans resynthèse.

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
3. Lancer la lecture, essayer pause et reprise, vérifier que musique et voix s’arrêtent ensemble. La reprise recommence au début du paragraphe.
4. Tester les favoris, fermer et rouvrir l’app : favoris et autorisations doivent rester.
5. Quitter l’application : la voix s’arrête et l’espace parent se verrouille.
6. Depuis l’espace parent, effacer les choix locaux et vérifier qu’une nouvelle autorisation est nécessaire et que les prénoms ont été effacés.

Sur iPhone, désactiver le mode silencieux et vérifier le volume. Les voix disponibles et leur qualité dépendent du système ; des ressources vocales peuvent devoir être téléchargées. La durée affichée est estimée et non mesurée sur un fichier.

**Non fourni / non validé :** génération sur un compte fournisseur réel, fichier audio téléchargeable, commandes écran verrouillé, lecture de fond, publication App Store. Un vrai build iOS et des essais sur appareil seront nécessaires pour la prochaine étape audio. TestFlight nécessitera un abonnement Apple Developer ; un build local avec signature gratuite est parfois possible sur Mac, avec limitations.

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
