const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');

/**
 * @swagger
 * /calendar/google:
 *   post:
 *     summary: Crée un événement Google Calendar à partir des disponibilités
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disponibilites:
 *                 type: string
 *                 example: "16/06/2025 08:00 - 10:00"
 *                 description: Date (française) et créneau horaire
 *               profId:
 *                 type: string
 *                 example: "60a7c0b1a73e4e3d2c4567ab"
 *                 description: ID MongoDB du professeur
 *               chapitres:
 *                 type: string
 *                 example: "Intégrales et fonctions"
 *               classe:
 *                 type: string
 *                 example: "Terminale S"
 *               location:
 *                 type: string
 *                 example: "Lycée Henri IV, Paris"
 *     responses:
 *       200:
 *         description: Événement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Utilisateur non authentifié
 *       500:
 *         description: Erreur serveur lors de la création de l'événement
 */
router.post('/google', calendarController.addGoogleCalendarEvent);

/**
 * @swagger
 * /calendar/ical:
 *   post:
 *     summary: Génère un fichier iCal (.ics) pour un événement de calendrier
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disponibilites:
 *                 type: string
 *                 example: "16/06/2025 08:00 - 10:00"
 *                 description: Date et créneau horaire au format "JJ/MM/AAAA HH:mm - HH:mm"
 *               profId:
 *                 type: string
 *                 example: "60a7c0b1a73e4e3d2c4567ab"
 *                 description: ID MongoDB du professeur
 *               chapitres:
 *                 type: string
 *                 example: "Intégrales et fonctions"
 *               classe:
 *                 type: string
 *                 example: "Terminale S"
 *               mode:
 *                 type: string
 *                 enum: [presentiel, visio]
 *                 example: "presentiel"
 *                 description: Mode du cours
 *               location:
 *                 type: string
 *                 example: "Lycée Henri IV, Paris"
 *                 description: Lieu du cours (si mode présentiel)
 *     responses:
 *       200:
 *         description: Fichier iCal généré et renvoyé en attachment
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Requête invalide (données manquantes)
 *       404:
 *         description: Professeur introuvable
 *       500:
 *         description: Erreur serveur lors de la génération du fichier iCal
 */
router.post('/ical', calendarController.addIcalEvent);

module.exports = router;