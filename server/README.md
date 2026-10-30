# Service familial — prototype privé

Écrit un récit puis le fait vérifier par un second appel au même modèle. Le parent doit toujours relire : ce contrôle automatique n'est pas une certification de sécurité. La narration reste assurée par le téléphone ; aucun fournisseur de voix professionnelle n'est intégré à cette version.

## Prérequis avant activation réelle

- Compte API Anthropic avec facturation (un abonnement Claude seul ne suffit pas), ou API OpenAI.
- Modèle disponible sur le compte, acceptant les outils structurés (Anthropic) ou JSON Schema (OpenAI). Aucun modèle « actuel » n'est présumé : renseigner son identifiant exact.
- Tarifs entrée/sortie vérifiés dans la documentation fournisseur. Les taux sont exprimés en **euros par million de tokens**, avec conversion USD/EUR et marge de change si nécessaire. Aucun tarif fournisseur n'est inclus ici.
- Examiner les conditions d'utilisation, données enfants, traitement, rétention, non-entraînement et transferts. Les prénoms et le détail libre sont transmis au fournisseur lors d'une création. Les contrôles de coordonnées ne garantissent pas la détection de toute donnée sensible.

Aucun appel payant n'est déclenché tant qu'une clé, un modèle et des taux positifs ne sont pas configurés. Aucune génération réelle n'a été validée dans l'environnement de développement faute de compte fournisseur configuré : les tests utilisent des réponses simulées.

## Configuration sur le Mac

Assistant local pour Anthropic : depuis le projet, lancer `npm run server:setup`. Il demande la clé avec saisie masquée, l'identifiant du modèle, les deux tarifs vérifiés et le budget 5 ou 10 €. Il ne lance aucun appel payant. Il crée des fichiers privés, refuse d'écraser une configuration existante et prépare une écoute sur le réseau familial (`0.0.0.0`). Conserver cet usage sur un Wi-Fi de confiance, sans redirection de port Internet. Le jeton de connexion est dans `server/.access-token` : il est différent de la clé Anthropic et ignoré par Git. La suite de cette section décrit la configuration manuelle alternative.

Créer `.env.server.local` à la racine du projet. Il est ignoré par Git. Ne jamais le partager, ni mettre de clé dans une variable `EXPO_PUBLIC_*`.

```dotenv
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=
AI_MODEL=
AI_INPUT_EUR_PER_MILLION=
AI_OUTPUT_EUR_PER_MILLION=
MONTHLY_BUDGET_EUR=5
SERVER_TOKEN=
SERVER_HOST=127.0.0.1
PORT=4180
```

`SERVER_TOKEN` doit être un jeton aléatoire d'au moins 32 caractères, distinct de la clé fournisseur. Le saisir dans l'appareil parent ; ne pas le publier. Pour OpenAI : `AI_PROVIDER=openai` et `OPENAI_API_KEY` à la place de `ANTHROPIC_API_KEY`.

```sh
npm run server
```

Par défaut, le serveur n'écoute que sur le Mac. Pour un essai iPhone sur un Wi-Fi familial de confiance, renseigner explicitement `SERVER_HOST=0.0.0.0`, puis utiliser `http://IP_LOCALE_DU_MAC:4180` dans l'espace parent. Ne jamais ouvrir ce port sur Internet ou configurer une redirection du routeur. HTTP expose les données et le jeton au réseau local : HTTPS est requis pour un hébergement distant et avant diffusion publique. Cette configuration n'est pas un service multi-foyers de production.

Dans **Parents → Le service familial**, renseigner l'adresse et le jeton du service (jamais la clé Anthropic/OpenAI). Le serveur répond avec l'identité du fournisseur ; le consentement de création l'affiche. La connexion reste en mémoire pour la session, sans stockage du jeton sur disque côté app.

## Utilisation

1. Choisir les personnages dans Parents.
2. Ouvrir Imaginer, choisir univers, mission, lieu, amis, ambiance et détail facultatif.
3. Autoriser la transmission au fournisseur puis vérifier le coût maximal.
4. Confirmer la création. Les deux appels sont exécutés sans retry automatique.
5. Relire le récit livré avant autorisation d'écoute. Le texte est sauvegardé localement et sa réécoute ne relance pas l'IA.

## Budget et reprises

SQLite (`server/family.sqlite`) conserve un registre persistant. Une transaction réserve le coût maximal estimé des deux appels avant de contacter le fournisseur. Le maximum inclut une borne conservatrice pour les entrées et les tokens de sortie. Après succès, les tokens déclarés par le fournisseur déterminent la dépense. Le mois comptable change à minuit UTC.

- 5 € par défaut, montant serveur supérieur à 10 € interdit ; le réglage serveur prévaut sur le choix local.
- Une demande identique rejouée avec la même clé renvoie le récit existant sans nouveaux appels. Modifier l'idée crée une nouvelle demande.
- Une seule génération simultanée. Échecs ambigus et récits bloqués conservent leur réservation par prudence.
- Après crash, une réservation restée `pending` bloque les créations : vérifier l'état fournisseur avant réconciliation manuelle, sans supprimer le registre.
- Le plafond dépend de taux correctement renseignés ; il ne remplace pas un contrôle côté fournisseur. L'API key doit être dédiée à ce service, sans autres consommateurs. Les alertes de facturation fournisseur ne sont pas nécessairement des plafonds d'arrêt.
- Si les tarifs, l'API ou le modèle changent, revalider avant usage. Aucun tarif ni contrat n'a été vérifié en direct ici.

## Données et limites

Le serveur conserve les récits pour récupérer les résultats après interruption. Ils contiennent les prénoms. Le registre n'est pas chiffré par l'application ; protéger le disque et ses sauvegardes. Ne jamais le committer. Les logs n'incluent ni texte, ni clé, ni prénom.

La suppression dans l'app efface la copie de cet appareil, **pas celle du serveur ni les éventuels journaux fournisseur**. Avant usage au-delà du cercle familial, il faut compléter purge coordonnée, rétention, sauvegardes et demandes d'effacement fournisseur. Pour la purge locale serveur, arrêter le service et utiliser le script ci-dessous : il retire les contenus tout en préservant les montants et identifiants comptables. Il ne doit pas y avoir de création en cours.

```sh
npm run server:purge
```

Pas de TTS professionnel, streaming, mémoire inter-épisodes ou publication App Store dans ce lot. Limite de bibliothèque locale : 100 récits créés ; supprimer une copie locale pour libérer une place. La sécurité réelle, la qualité narrative et les latences doivent encore être évaluées sur le fournisseur et l'iPhone.

## Vérification sans frais

```sh
npm run test:server
npm run test:e2e
```

Les tests serveur vérifient fournisseur simulé, idempotence, authentification, refus de budget, retenue après timeout, refus éditorial et concurrence. Les tests d'interface vérifient aussi le consentement, l'estimation et la relecture. Ils ne prouvent pas la qualité réelle d'un récit IA.
