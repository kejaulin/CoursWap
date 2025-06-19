const quizService = require('../services/quizService');
const authService = require('../services/authService');

// Middleware pour vérifier le rôle professeur
function ensureProf(req, res, next) {
    if (req.user && req.user.role === 'professeur') return next();
    return res.status(403).json({ error: 'Accès réservé aux professeurs' });
}

// Middleware pour vérifier le rôle étudiant
function ensureStudent(req, res, next) {
    if (req.user && req.user.role === 'etudiant') return next();
    return res.status(403).json({ error: 'Accès réservé aux étudiants' });
}

module.exports = {
    ensureProf,
    ensureStudent,

    // Professeur : créer un quiz
    async createQuiz(req, res) {
        try {
            let googleAuth = null;
            try {
                googleAuth = await authService.getAuthorizedClient(req.user);
            } catch (err) {
                // Pas de Google Auth, on continue sans Google Form
                console.warn('Google Auth non disponible, quiz créé localement');
            }
            const quiz = await quizService.createQuiz(req.body, req.user, googleAuth);
            res.status(201).json(quiz);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Professeur : voir ses propres quiz
    async getMyQuizzes(req, res) {
        try {
            const quizzes = await quizService.getQuizzesByProf(req.user._id);
            res.json(quizzes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Professeur : mettre à jour un quiz
    async updateQuiz(req, res) {
        const quiz = await quizService.updateQuiz(req.params.id, req.body);
        try {
            const quiz = await quizService.updateQuiz(req.params.id, req.body);
            res.json(quiz);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Professeur : supprimer un quiz
    async deleteQuiz(req, res) {
        try {
            await quizService.deleteQuiz(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Étudiant : lister les quiz disponibles
    async listAvailableQuizzes(req, res) {
        try {
            const quizzes = await quizService.getAllQuizzes({ availableOnly: true });
            res.json(quizzes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Étudiant : obtenir l'URL du Google Form pour répondre
    async getQuizFormUrl(req, res) {
        try {
            const url = await quizService.getQuizFormUrl(req.params.id);
            if (!url) return res.status(404).json({ error: 'Quiz non trouvé' });
            res.json({ url });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Tous : voir un quiz par ID
    async getQuizById(req, res) {
        try {
            const quiz = await quizService.getQuizById(req.params.id);
            if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });
            res.json(quiz);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}; 