const Quiz = require('../models/Quiz');

// Créer un nouveau quiz
exports.createQuiz = async (req, res) => {
    try {
        const quizData = {
            ...req.body,
            createdBy: req.user.id
        };
        const quiz = new Quiz(quizData);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: error.message });
    }
};

// Lister tous les quizs
exports.listQuizzes = async (req, res) => {
    try {
        const { myQuizzes } = req.query;
        let query = {};
        
        // Si myQuizzes=true, ne montrer que les quizs de l'utilisateur
        if (myQuizzes === 'true') {
            query.createdBy = req.user.id;
        }
        
        const quizzes = await Quiz.find(query)
            .sort({ createdAt: -1 }); // Trier par date de création décroissante
        
        res.json(quizzes);
    } catch (error) {
        console.error('Error listing quizzes:', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtenir un quiz spécifique
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz non trouvé' });
        }
        
        res.json(quiz);
    } catch (error) {
        console.error('Error getting quiz:', error);
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour un quiz
exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz non trouvé' });
        }
        
        res.json(quiz);
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz non trouvé' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ error: error.message });
    }
};

// Soumettre une réponse à un quiz
exports.submitQuizResponse = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz non trouvé' });
        }

        const { responses } = req.body;
        let score = 0;
        let totalPoints = 0;

        responses.forEach(response => {
            const question = quiz.questions.find(q => q._id.toString() === response.questionId);
            if (question && response.answer === question.correctAnswer) {
                score += question.points;
            }
            totalPoints += question.points;
        });

        res.json({
            score,
            totalPoints,
            percentage: (score / totalPoints) * 100
        });
    } catch (error) {
        console.error('Error submitting quiz response:', error);
        res.status(500).json({ error: error.message });
    }
}; 