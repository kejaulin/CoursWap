const express = require('express');
const router = express.Router();
const formControllers = require('../controllers/formControllers');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Forms
 *   description: API pour la gestion des quizs
 */

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Créer un nouveau quiz
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Quiz créé avec succès
 *       401:
 *         description: Non authentifié
 */
router.post('/quizzes', authenticateToken, formControllers.createQuiz);

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Lister tous les quizs
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des quizs
 *       401:
 *         description: Non authentifié
 */
router.get('/quizzes', authenticateToken, formControllers.listQuizzes);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Obtenir un quiz spécifique
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du quiz
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Quiz non trouvé
 */
router.get('/quizzes/:id', authenticateToken, formControllers.getQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Supprimer un quiz
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Quiz supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Quiz non trouvé
 */
router.delete('/quizzes/:id', authenticateToken, formControllers.deleteQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Mettre à jour un quiz
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quiz mis à jour avec succès
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Quiz non trouvé
 */
router.put('/quizzes/:id', authenticateToken, formControllers.updateQuiz);

/**
 * @swagger
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Soumettre une réponse à un quiz
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - responses
 *             properties:
 *               responses:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Score du quiz
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Quiz non trouvé
 */
router.post('/quizzes/:id/submit', authenticateToken, formControllers.submitQuizResponse);

module.exports = router; 