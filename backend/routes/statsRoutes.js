const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsControllers');

/**
 * @swagger
 * /api/stats/onetooneevents:
 *   get:
 *     summary: Récupère les statistiques des rendez-vous par professeurs et étudiants
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Statistiques des rendez-vous
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 professeurs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID du professeur
 *                       totalCreneaux:
 *                         type: integer
 *                         description: Nombre total de créneaux
 *                 etudiants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID de l’étudiant
 *                       totalCreneaux:
 *                         type: integer
 *                         description: Nombre total de créneaux
 *       500:
 *         description: Erreur du serveur
 */
router.get('/onetooneevents', statsController.getStats);


module.exports = router;
