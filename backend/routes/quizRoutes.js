const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Gestion des quiz (professeur/étudiant, Google Forms)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         isAvailable:
 *           type: boolean
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         googleFormId:
 *           type: string
 *         googleFormUrl:
 *           type: string
 *     Question:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *         type:
 *           type: string
 *           enum: [CHOICE, TEXT, MULTIPLE_CHOICE]
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *         correctAnswer:
 *           type: string
 *         points:
 *           type: integer
 *
 */

// Middleware d'auth (doit être défini dans le projet, sinon à adapter)
function ensureAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ error: 'Non authentifié' });
}

// PROFESSEUR
/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Créer un quiz (Google Form auto-créé)
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quiz'
 *     responses:
 *       201:
 *         description: Quiz créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux professeurs
 */
router.post('/', ensureAuth, quizController.ensureProf, quizController.createQuiz); // Créer un quiz
/**
 * @swagger
 * /quizzes/my:
 *   get:
 *     summary: Voir ses propres quiz (professeur)
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des quiz du professeur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux professeurs
 */
router.get('/my', ensureAuth, quizController.ensureProf, quizController.getMyQuizzes); // Voir ses quiz
/**
 * @swagger
 * /quizzes/{id}:
 *   put:
 *     summary: Modifier un quiz (professeur)
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quiz'
 *     responses:
 *       200:
 *         description: Quiz modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux professeurs
 */
router.put('/:id', ensureAuth, quizController.ensureProf, quizController.updateQuiz); // Modifier un quiz
/**
 * @swagger
 * /quizzes/{id}:
 *   delete:
 *     summary: Supprimer un quiz (professeur)
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du quiz
 *     responses:
 *       200:
 *         description: Quiz supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux professeurs
 */
router.delete('/:id', ensureAuth, quizController.ensureProf, quizController.deleteQuiz); // Supprimer un quiz

// ETUDIANT
/**
 * @swagger
 * /quizzes/available:
 *   get:
 *     summary: Lister les quiz disponibles (étudiant)
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des quiz disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux étudiants
 */
router.get('/available', ensureAuth, quizController.ensureStudent, quizController.listAvailableQuizzes); // Lister quiz disponibles
/**
 * @swagger
 * /quizzes/{id}/form:
 *   get:
 *     summary: Obtenir l'URL du Google Form pour répondre (étudiant)
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du quiz
 *     responses:
 *       200:
 *         description: URL du Google Form
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès réservé aux étudiants
 *       404:
 *         description: Quiz non trouvé
 */
router.get('/:id/form', ensureAuth, quizController.ensureStudent, quizController.getQuizFormUrl); // Obtenir l'URL du Google Form pour répondre

// TOUS
/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Voir un quiz par ID (tous)
 *     tags: [Quizzes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du quiz
 *     responses:
 *       200:
 *         description: Quiz trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Quiz non trouvé
 */
router.get('/:id', ensureAuth, quizController.getQuizById); // Voir un quiz par ID

module.exports = router; 