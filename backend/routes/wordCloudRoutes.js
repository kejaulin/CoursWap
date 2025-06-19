const express = require('express');
const router = express.Router();
const wordCloudController = require('../controllers/wordCloudController');

/**
 * @swagger
 * /wordclouds:
 *   post:
 *     summary: Génère un nuage de mots à partir de texte
 *     tags:
 *       - WordClouds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texte à analyser pour générer le nuage de mots
 *                 example: "Voici un exemple de texte pour générer un nuage de mots"
 *     responses:
 *       201:
 *         description: Nuage de mots créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: Image encodée en base64 du nuage de mots
 */
router.post('/', wordCloudController.createWordCloud);

/**
 * @swagger
 * /wordclouds/{id}:
 *   get:
 *     summary: Récupère un nuage de mots par son ID
 *     tags:
 *       - WordClouds
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du nuage de mots
 *     responses:
 *       200:
 *         description: Nuage de mots trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image:
 *                   type: string
 *                   description: Image encodée en base64 du nuage de mots
 *       404:
 *         description: Nuage de mots non trouvé
 */
router.get('/:id', wordCloudController.getWordCloud);

module.exports = router;
