const express = require('express');
const router = express.Router();
const meetController = require('../controllers/meetControllers');
const useAppTokenApiKey = require('../middleware/tokenApiMiddleware');
/**
 * @swagger
 * /meetings:
 *   post:
 *     summary: Créer une réunion Google Meet
 *     tags:
 *       - Meetings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matiere:
 *                 type: string
 *                 example: Mathématiques
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
 *               rejoinCost:   
 *                 description: Prix pour rejoindre la réunion 
 *                 type: number
 *                 example: 0
 *                 min: 0
 *               participants:
 *                 type: array
 *                 description: Liste des IDs des participants
 *                 items: [String]
 *               keywords:
 *                 type: array
 *                 description: Liste de mots clés
 *                 items: [String]
 *     responses:
 *       201:
 *         description: Réunion créée
 */
router.post('/', useAppTokenApiKey, meetController.createMeet);

/**
 * @swagger
 * /meetings:
 *   get:
 *     summary: Liste toutes les réunions Google Meet
 *     tags:
 *       - Meetings
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
 *     tags:
 *       - Meetings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique du meeting
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
 *     tags:
 *       - Meetings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique du meeting
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
 *     tags:
 *       - Meetings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique du meeting
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
 * /meetings/{id}/join:
 *   post:
 *     summary: Rejoindre un meeting côté app
 *     description: Ajoute un participant à un meeting. Récompense le créateur en fonction du nombre de participants.
 *     tags:
 *       - Meetings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant unique du meeting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantInfos:
 *                 type: object
 *                 description: Informations à propos du participant 
 *                 example:
 *                   _id: "665fe38b2c10cf75d8e14d5b"
 *                   nom: "Alice"
 *     responses:
 *       200:
 *         description: Confirmation de la participation au meeting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       404:
 *         description: Meeting non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Meeting not found"
 *       500:
 *         description: Erreur du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/:id/join',useAppTokenApiKey, meetController.joinMeet);

/**
 * @swagger
 * /meetings/reverse-geocode:
 *   post:
 *     summary: Récupère une adresse à partir d'une longitude et latitude
 *     tags:
 *       - Meetings
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