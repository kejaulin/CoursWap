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

// Upload vidéo
router.post('/upload', ensureAuth, upload.single('video'), videoController.uploadVideo);

// Liste toutes les vidéos
router.get('/', videoController.listAllVideos);

// Liste les vidéos d'un utilisateur
router.get('/user/:userId', videoController.listUserVideos);

// Liste les vidéos d'une catégorie
router.get('/category/:category', videoController.listCategoryVideos);

// Lire les infos d'une vidéo
router.get('/:id', videoController.getVideo);

// Stream vidéo
router.get('/:id/stream', videoController.streamVideo);

// Supprimer une vidéo
router.delete('/:id', ensureAuth, videoController.deleteVideo);

module.exports = router;