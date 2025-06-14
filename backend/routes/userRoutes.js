const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const userControllers = require('../controllers/userControlleurs');

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
  res.status(401).json({ success: false, error: "Non authentifié" });
}
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Enregistre ou met à jour un utilisateur connecté
 *     tags: [Utilisateurs]
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
router.post('/register', ensureAuth, upload.single('photo'), userControllers.register);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Récupère les infos de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 * 
 *         description: Données utilisateur
 */
router.get('/me', userControllers.getMe);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupère tous les professeurs
 *     tags: [Utilisateurs]
 */
router.get('/', userControllers.getAllProfs);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupère un professeur par ID
 *     tags: [Utilisateurs]
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
 *     tags: [Utilisateurs]
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
module.exports = router;