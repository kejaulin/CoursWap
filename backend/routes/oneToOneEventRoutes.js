const express = require('express');
const router = express.Router();
const OneToOneEvent = require('../models/OneToOneEvent');
const oneToOneEventController = require('../controllers/OneToOneControllers');


/**
 * @swagger
 * /api/onetooneevents/create:
 *   post:
 *     summary: Crée un rendez-vous
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profId:
 *                 type: string
 *               date:
 *                 type: string
 *               heure:
 *                 type: string
 *               mode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réunion créée avec succès
 */
router.post('/create', oneToOneEventController.createOneToOneEvent);

/**
 * @swagger
 * /api/onetooneevents/my-meetings:
 *   get:
 *     summary: Liste des rendez-vous de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des réunions
 */
router.get('/my-meetings', oneToOneEventController.getMyOneToOneEvent);



/**
 * @swagger
 * /api/onetooneevents/{id}:
 *   delete:
 *     summary: Supprime une réunion
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réunion supprimée
 */
router.delete('/:id', oneToOneEventController.deleteOneToOneEvent);


module.exports = router;