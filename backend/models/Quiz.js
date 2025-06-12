const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['CHOICE', 'TEXT', 'MULTIPLE_CHOICE'],
        required: true
    },
    options: [{
        text: String,
        isCorrect: Boolean
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 1
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pour mettre à jour updatedAt
quizSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Quiz', quizSchema); 