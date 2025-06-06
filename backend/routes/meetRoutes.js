const express = require('express');
const router = express.Router();
const meetController = require('../controllers/meetControllers');

/**
 * @swagger
 * /meetings:
 *   post:
 *     summary: Créer une réunion Google Meet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summary:
 *                 type: string
 *                 example: Réunion de test
 *               startDateTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-06-03T10:00:00.000Z
 *               endDateTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-06-03T11:00:00.000Z
 *     responses:
 *       201:
 *         description: Réunion créée
 */
router.post('/', meetController.createMeet);

/**
 * @swagger
 * /meetings:
 *   get:
 *     summary: Liste toutes les réunions Google Meet
 *     responses:
 *       200:
 *         description: Liste des réunions
 */
router.get('/', meetController.listMeets);

/**
 * @swagger
 * /meetings/{id}:
 *   get:
 *     summary: Récupère une réunion par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réunion trouvée
 */
router.get('/:id', meetController.getMeet);

/**
 * @swagger
 * /meetings/{id}:
 *   delete:
 *     summary: Supprime une réunion par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Réunion supprimée
 */
router.delete('/:id', meetController.deleteMeet);

/**
 * @swagger
 * /meetings/{id}:
 *   put:
 *     summary: Met à jour une réunion par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Réunion mise à jour
 */
router.put('/:id', meetController.updateMeet);

/**
 * @swagger
 * /meetings/reverse-geocode:
 *   post:
 *     summary: Récupère une adresse à partir d'une longitude et latitude
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lat:
 *                 type: number
 *                 example: 48.2692
 *               lng:
 *                 type: number
 *                 example: 4.0668
 *     responses:
 *       201:
 *         description: Adresse postale
 */
router.post('/reverse-geocode', meetController.reverseGeocode);

module.exports = router;