const express = require('express');
const router = express.Router();
const multer = require('multer');
const userControllers = require('../controllers/userController');
const User = require('../models/User');
const useAppTokenApiKey  = require('../middleware/tokenApiMiddleware');

//Gestion des images 
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Garde l'extension d'origine
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Middleware d'auth pour être sûr que req.user existe (sinon erreur 401)
function ensureAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ success: false, error: "Non authentifié" });
}

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Enregistre ou met à jour un utilisateur connecté
 *     tags:
 *       - Users
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: photo
 *         type: file
 *         description: Photo de profil
 *     responses:
 *       200:
 *         description: Utilisateur enregistré ou mis à jour
 */
router.post('/register', ensureAuth, upload.single('photo'), userControllers.registerUser);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Récupère les infos de l'utilisateur connecté
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Données utilisateur
 */
router.get('/me', userControllers.getMe);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère tous les professeurs
 *     tags:
 *       - Users
 */
router.get('/', userControllers.getAllProfs);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère un professeur par ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 */
router.get('/:id', userControllers.getProfById);

/**
 * @swagger
 * /api/users/{id}/disponibilites:
 *   put:
 *     summary: Met à jour les disponibilités du professeur
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             date:
 *               type: string
 *             creneau:
 *               type: string
 */
router.put('/:id/disponibilites', ensureAuth, userControllers.updateDisponibilites);

/**
 * @swagger
 * /users/{id}/addresses:
 *   get:
 *     summary: Récupérer les adresses associées à un utilisateur
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur (professeur)
 *     responses:
 *       200:
 *         description: Liste des adresses du professeur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meetingLocations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         description: Identifiant unique de l'adresse
 *                       location:
 *                         type: object
 *                         properties:
 *                           street:
 *                             type: string
 *                             description: Rue
 *                           city:
 *                             type: string
 *                             description: Ville
 *                           postalCode:
 *                             type: string
 *                             description: Code postal
 *                           country:
 *                             type: string
 *                             description: Pays
 *       404:
 *         description: Aucune adresse trouvée pour ce professeur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Aucune adresse trouvée pour ce professeur
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Message d'erreur
 */
router.get('/:id/addresses', userControllers.profAddresses);

/**
 * @swagger
 * /users/{id}/saveaddresses:
 *   put:
 *     summary: Remplace les adresses de réunion d’un utilisateur
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID MongoDB de l'utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetingLocations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       example: maison
 *                     location:
 *                       type: object
 *                       properties:
 *                         add:
 *                           type: string
 *                           example: 123 rue de Paris, 75000 Paris
 *           example:
 *             meetingLocations:
 *               - key: maison
 *                 location:
 *                   add: 123 rue de Paris, 75000 Paris
 *               - key: travail
 *                 location:
 *                   add: 78 avenue Victor Hugo, 75016 Paris
 *     responses:
 *       200:
 *         description: Adresses mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meeting locations updated
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/saveaddresses', userControllers.geocode );

/**
 * @swagger
 * /users/{id}/tokens:
 *   get:
 *     summary: Obtenir le nombre actuel de tokens d’un utilisateur
 *     description: Cette route retourne le solde actuel de tokens d’un utilisateur spécifique, en utilisant la clé d'API de l'application.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant de l’utilisateur
 *     responses:
 *       200:
 *         description: Solde actuel des tokens de l’utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: integer
 *               example: 10
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Une erreur est survenue lors de la récupération du solde
 */
router.get('/:id/tokens',useAppTokenApiKey, userControllers.getUserCurrentTokenAmount);

/**
 * @swagger
 * /users/{id}/tokens/subtract:
 *   post:
 *     summary: Soustraire un nombre de tokens à un utilisateur
 *     description: Cette route permet de retirer un certain nombre de tokens à un utilisateur identifié.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant de l’utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Nombre de tokens à retirer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Nouveau solde de tokens après soustraction
 *         content:
 *           application/json:
 *             schema:
 *               type: integer
 *               example: 10
 *       500:
 *         description: Erreur du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Erreur lors de la soustraction des tokens
 */
router.post('/:id/tokens/subtract',useAppTokenApiKey, userControllers.substractUserToken);

module.exports = router;