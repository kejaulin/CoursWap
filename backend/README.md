# Application de Quiz avec Google Forms

Cette application permet aux enseignants de créer, modifier et gérer des quiz via Google Forms pour évaluer leurs étudiants.

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Un compte Google avec accès à Google Forms API
- Les identifiants OAuth2 de Google (Client ID et Client Secret)

## Configuration

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd [NOM_DU_REPO]
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/statushttp://localhost:4000/auth/google/callback
```

4. Activez les APIs Google nécessaires :
- Google Forms API
- Google Drive API
- Google OAuth2 API

## Démarrage

1. Démarrez le serveur :
```bash
npm start
```

2. L'application sera accessible à l'adresse : `http://localhost:3000`

## Utilisation de l'API

### Créer un quiz
```http
POST /api/quizzes
Content-Type: application/json

{
    "title": "Quiz de Mathématiques",
    "description": "Quiz sur les fonctions",
    "category": "Mathématiques",
    "numberOfQuestions": 5
}
```

### Lister tous les quiz
```http
GET /api/quizzes
```

### Obtenir un quiz spécifique
```http
GET /api/quizzes/:id
```

### Modifier un quiz
```http
PUT /api/quizzes/:id
Content-Type: application/json

{
    "title": "Nouveau titre",
    "description": "Nouvelle description"
}
```

### Supprimer un quiz
```http
DELETE /api/quizzes/:id
```

## Tests

Pour exécuter les tests :
```bash
npm test
```

## Structure du projet

```
backend/
  ├── controllers/
  │   ├── formControllers.js
  │   └── meetControllers.js
  ├── services/
  │   ├── formService.js
  │   └── authService.js
  ├── routes/
  │   └── formRoutes.js
  └── app.js
```

## Sécurité

- L'authentification est gérée via Google OAuth2
- Les tokens sont stockés de manière sécurisée
- Les requêtes sont validées avant traitement

## Support

Pour toute question ou problème, veuillez créer une issue dans le repository. 