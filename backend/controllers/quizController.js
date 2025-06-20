const quizService = require('../services/quizService');
const authService = require('../services/authService');
const mongoose = require('mongoose');
const Quiz = mongoose.model('Quiz');
const QuizAttempt = mongoose.model('QuizAttempt');

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
    async getAvailableQuizzes(req, res) {
        try {
            const quizzes = await Quiz.find({ isAvailable: true }).populate('professor', 'name email');
            res.json(quizzes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Étudiant : soumettre un quiz
    async submitQuiz(req, res) {
        try {
            const quizId = req.params.id;
            const userId = req.user._id;
            const { answers } = req.body; // { questionId: answer }

            const quiz = await Quiz.findById(quizId);
            if (!quiz) return res.status(404).json({ error: 'Quiz non trouvé' });

            let pointsEarned = 0;
            let totalPoints = 0;

            quiz.questions.forEach(q => {
                totalPoints += q.points || 0;
                const userAnswer = answers[q._id];
                if (userAnswer && q.correctAnswer) {
                    if (Array.isArray(userAnswer)) { // MULTIPLE_CHOICE
                        if (userAnswer.sort().join(',') === q.correctAnswer.split(',').sort().join(',')) {
                            pointsEarned += q.points;
                        }
                    } else { // CHOICE or TEXT
                        if (userAnswer.toLowerCase() === q.correctAnswer.toLowerCase()) {
                            pointsEarned += q.points;
                        }
                    }
                }
            });

            const attempt = new QuizAttempt({
                quiz: quizId,
                user: userId,
                answers,
                pointsEarned,
                totalPoints
            });
            await attempt.save();

            res.json({ pointsEarned, totalPoints, attemptId: attempt._id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    
    // Étudiant : récupérer ses stats
    async getStudentStats(req, res) {
        try {
            const userId = req.user._id;
            const attempts = await QuizAttempt.find({ user: userId }).populate({
                path: 'quiz',
                select: 'category'
            });

            const totalQuizAnswered = attempts.length;
            const totalPointsEarned = attempts.reduce((sum, attempt) => sum + attempt.pointsEarned, 0);
            
            const quizzesByCategory = attempts.reduce((acc, attempt) => {
                if (attempt.quiz && attempt.quiz.category) {
                    const category = attempt.quiz.category;
                    acc[category] = (acc[category] || 0) + 1;
                }
                return acc;
            }, {});

            res.json({
                totalQuizAnswered,
                totalPointsEarned,
                quizzesByCategory
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Étudiant : obtenir l'URL du Google Form pour répondre
    async getQuizFormUrl(req, res) {
        try {
            const quiz = await Quiz.findById(req.params.id);
            if (!quiz || !quiz.googleFormUrl) return res.status(404).json({ error: 'Formulaire de quiz non trouvé' });
            res.json({ url: quiz.googleFormUrl });
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