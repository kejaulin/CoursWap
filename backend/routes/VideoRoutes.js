const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../services/s3Service');
const videoController = require('../controllers/videoController');
const Video = require('../models/Video');

// Middleware d'auth (à adapter selon votre projet)
function ensureAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: "Non authentifié" });
}

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `videos/${Date.now()}_${file.originalname}`);
    }
  })
});

/**
 * @swagger
 * /videos/upload:
 *   post:
 *     summary: Upload d'une nouvelle vidéo
 *     tags: [Videos]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vidéo uploadée avec succès
 *       400:
 *         description: Aucun fichier envoyé
 *       401:
 *         description: Non authentifié
 */
router.post('/upload', ensureAuth, upload.single('video'), videoController.uploadVideo);

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Liste toutes les vidéos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Liste des vidéos
 */
router.get('/', videoController.listAllVideos);

/**
 * @swagger
 * /videos/user/{userId}:
 *   get:
 *     summary: Liste les vidéos d'un utilisateur
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des vidéos de l'utilisateur
 */
router.get('/user/:userId', videoController.listUserVideos);

/**
 * @swagger
 * /videos/category/{category}:
 *   get:
 *     summary: Liste les vidéos d'une catégorie
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Catégorie de la vidéo
 *     responses:
 *       200:
 *         description: Liste des vidéos de la catégorie
 */
router.get('/category/:category', videoController.listCategoryVideos);

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Obtenir les infos d'une vidéo
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la vidéo
 *     responses:
 *       200:
 *         description: Infos de la vidéo
 *       404:
 *         description: Vidéo non trouvée
 */
router.get('/:id', videoController.getVideo);

/**
 * @swagger
 * /videos/{id}/stream:
 *   get:
 *     summary: Streamer une vidéo
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la vidéo
 *     responses:
 *       200:
 *         description: Flux vidéo (stream)
 *       404:
 *         description: Vidéo non trouvée
 */
router.get('/:id/stream', videoController.streamVideo);

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Supprimer une vidéo
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la vidéo
 *     responses:
 *       200:
 *         description: Vidéo supprimée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Vidéo non trouvée
 */
router.delete('/:id', ensureAuth, videoController.deleteVideo);

module.exports = router;