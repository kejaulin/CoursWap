const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const Quiz = require('../models/Quiz');

class FormService {
    constructor() {
        this.forms = google.forms('v1');
        this.categories = ['Mathématiques', 'Français', 'Anglais', 'Histoire', 'Géographie', 'Sciences'];
    }

    // Utility methods for Google Forms
    async createForm(auth, title, description) {
        const form = await this.forms.forms.create({
            auth,
            requestBody: {
                info: {
                    title,
                    description,
                    documentTitle: title
                }
            }
        });
        return form.data.formId;
    }

    async addCategoryField(auth, formId) {
        await this.forms.forms.batchUpdate({
            auth,
            formId,
            requestBody: {
                requests: [{
                    createItem: {
                        item: {
                            title: 'Catégorie',
                            questionItem: {
                                question: {
                                    choiceQuestion: {
                                        type: 'RADIO',
                                        options: this.categories.map(cat => ({ value: cat })),
                                        shuffle: false
                                    }
                                }
                            }
                        },
                        location: { index: 0 }
                    }
                }]
            }
        });
    }

    async addQuestions(auth, formId, questions) {
        const requests = questions.map((question, index) => ({
            createItem: {
                item: {
                    title: question.question,
                    questionItem: {
                        question: {
                            choiceQuestion: {
                                type: 'RADIO',
                                options: question.options.map(opt => ({
                                    value: opt.text
                                })),
                                shuffle: true
                            }
                        }
                    }
                },
                location: { index: index + 1 }
            }
        }));

        await this.forms.forms.batchUpdate({
            auth,
            formId,
            requestBody: { requests }
        });
    }

    async updateFormInfo(auth, formId, title, description) {
        await this.forms.forms.batchUpdate({
            auth,
            formId,
            requestBody: {
                requests: [{
                    updateFormInfo: {
                        info: { title, description },
                        updateMask: 'title,description'
                    }
                }]
            }
        });
    }

    async updateQuestions(auth, formId, questions) {
        const requests = questions.map((question, index) => ({
            updateItem: {
                item: {
                    title: question.question,
                    questionItem: {
                        question: {
                            choiceQuestion: {
                                type: 'RADIO',
                                options: question.options.map(opt => ({
                                    value: opt.text
                                })),
                                shuffle: true
                            }
                        }
                    }
                },
                location: { index: index + 1 },
                updateMask: 'title,questionItem'
            }
        }));

        await this.forms.forms.batchUpdate({
            auth,
            formId,
            requestBody: { requests }
        });
    }

    // Main methods (CRUD)
    async createQuiz(auth, quizData) {
        try {
            const { title, description, category, questions } = quizData;
            const formId = await this.createForm(auth, title, description);
            await this.addCategoryField(auth, formId);
            await this.addQuestions(auth, formId, questions);

            // Save in the database
            const quiz = new Quiz({
                title,
                description,
                category,
                questions,
                googleFormId: formId,
                createdBy: auth.userId
            });

            await quiz.save();

            return {
                formId,
                title,
                description,
                category,
                questions,
                formUrl: `https://docs.google.com/forms/d/${formId}/edit`,
                quizId: quiz._id
            };
        } catch (error) {
            throw new Error(`Error creating quiz: ${error.message}`);
        }
    }

    async listQuizzes(auth) {
        try {
            const quizzes = await Quiz.find({ createdBy: auth.userId });
            const formsPromises = quizzes.map(quiz => 
                this.forms.forms.get({
                    auth,
                    formId: quiz.googleFormId
                })
            );
            
            const formsData = await Promise.all(formsPromises);
            
            return quizzes.map((quiz, index) => ({
                ...quiz.toObject(),
                formData: formsData[index].data
            }));
        } catch (error) {
            throw new Error(`Error listing quizzes: ${error.message}`);
        }
    }

    async getQuiz(auth, quizId) {
        try {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            const formData = await this.forms.forms.get({
                auth,
                formId: quiz.googleFormId
            });

            return {
                ...quiz.toObject(),
                formData: formData.data
            };
        } catch (error) {
            throw new Error(`Error getting quiz: ${error.message}`);
        }
    }

    async deleteQuiz(auth, quizId) {
        try {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            await this.forms.forms.delete({
                auth,
                formId: quiz.googleFormId
            });

            await Quiz.findByIdAndDelete(quizId);
            
            return true;
        } catch (error) {
            throw new Error(`Error deleting quiz: ${error.message}`);
        }
    }

    async updateQuiz(auth, quizId, quizData) {
        try {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            const { title, description, questions } = quizData;
            await this.updateFormInfo(auth, quiz.googleFormId, title, description);
            if (questions) {
                await this.updateQuestions(auth, quiz.googleFormId, questions);
            }

            const updatedQuiz = await Quiz.findByIdAndUpdate(
                quizId,
                { ...quizData, updatedAt: Date.now() },
                { new: true }
            );

            return updatedQuiz;
        } catch (error) {
            throw new Error(`Error updating quiz: ${error.message}`);
        }
    }

    async submitQuizResponse(auth, quizId, responses) {
        try {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            const { score, totalPoints } = this.calculateScore(quiz.questions, responses);

            return {
                score,
                totalPoints,
                percentage: (score / totalPoints) * 100
            };
        } catch (error) {
            throw new Error(`Error submitting quiz response: ${error.message}`);
        }
    }

    calculateScore(questions, responses) {
        let score = 0;
        let totalPoints = 0;

        responses.forEach(response => {
            const question = questions.find(q => q._id.toString() === response.questionId);
            if (question && response.answer === question.correctAnswer) {
                score += question.points;
            }
            totalPoints += question.points;
        });

        return { score, totalPoints };
    }
}

module.exports = new FormService(); 