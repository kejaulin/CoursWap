const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');

/**
 * @swagger
 * /tokens/webhook:
 *   post:
 *     summary: Gère les webhooks de régénération de jetons
 *     description: Ce point de terminaison est appelé par des services externes lorsque les jetons d'une application sont régénérés. Il émet une notification en temps réel à tous les clients connectés via Socket.io et abonnés à l'appId concerné.
 *     tags:
 *       - Jetons
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - appId
 *               - regeneratedAt
 *             properties:
 *               event:
 *                 type: string
 *                 example: tokens_regenerated
 *                 description: Type d’événement envoyé.
 *               appId:
 *                 type: string
 *                 example: 648fa7bd33cf4f001a52e9f4
 *                 description: Identifiant de l'application concernée.
 *               regeneratedAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-06-11T14:23:00Z
 *                 description: Date et heure de régénération des jetons.
 *     responses:
 *       200:
 *         description: Webhook traité avec succès, notification envoyée aux clients.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Requête invalide ou type d’événement non supporté.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Payload invalide ou incomplet
 *       500:
 *         description: Erreur du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur serveur interne
 */
router.post('/webhook', tokenController.webhookInfos);  

module.exports = router;
