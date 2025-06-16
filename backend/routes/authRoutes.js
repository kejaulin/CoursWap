const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const useAppTokenApiKey  = require('../middleware/tokenApiMiddleware');

router.get('/google', authController.googleAuthenticate);

router.get('/google/callback', authController.googleCallback);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déconnexion réussie
 *       500:
 *         description: Erreur du serveur
 */
router.post('/logout', authController.userLogout);

/**
 * @swagger
 * /auth/current_user:
 *   get:
 *     summary: Récupère l'utilisateur actuellement authentifié
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Utilisateur actuellement connecté ou objet vide s'il n'est pas connecté
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/User'
 *                 - type: object
 *                   example: {}
 *       500:
 *         description: Erreur du serveur
 */
router.get('/current_user', authController.getCurrentUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authentification utilisateur avec stratégie locale
 *     description: Permet à un utilisateur de se connecter via email/mot de passe (passport local).
 *     requestBody:
 *       description: Données d'authentification
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: myStrongPassword123
 *     responses:
 *       200:
 *         description: Connexion réussie, renvoie les infos utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   $ref: '#/components/schemas/user'
 *       401:
 *         description: Échec de l'authentification, utilisateur ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Erreur du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/login', authController.userLocalLogin);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Création d'un nouvel utilisateur avec inscription locale
 *     description: Enregistre un utilisateur avec email + mot de passe, hash le mot de passe et crée la session.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       description: Données de l'utilisateur à créer
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: myStrongPassword123
 *     responses:
 *       200:
 *         description: Inscription réussie et connexion automatique
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Impossible de créer l'utilisateur
 *       500:
 *         description: Erreur serveur interne (hash, base de données, session)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur de session
 */
router.post('/register', useAppTokenApiKey, authController.userRegister);

/**
 * @swagger
 * /auth/appinfos:
 *   get:
 *     summary: Récupère les informations de l'application liée à l'utilisateur connecté
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Liste des applications disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/App'
 *       500:
 *         description: Erreur serveur lors de la récupération des données
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Message d'erreur
 */
router.get('/appinfos', authController.getAppInfos);


module.exports = router;