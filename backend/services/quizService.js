const Quiz = require('../models/Quiz');
const { google } = require('googleapis');

/**
 * Crée un Google Form à partir d'un quiz et retourne son ID et URL.
 * @param {Object} quiz - L'objet quiz (title, description, questions, etc.)
 * @param {OAuth2Client} googleAuth - Le client OAuth2 authentifié du professeur
 * @returns {Promise<{formId: string, formUrl: string}>}
 */
async function createGoogleFormQuiz(quiz, googleAuth) {
    const forms = google.forms({ version: 'v1', auth: googleAuth });

    // 1. Créer le formulaire avec SEULEMENT le titre
    const createRes = await forms.forms.create({
        requestBody: {
            info: {
                title: quiz.title
            }
        }
    });
    const formId = createRes.data.formId;

    // 2. Préparer les requêtes batchUpdate pour description et questions
    const requests = [];
    if (quiz.description) {
        requests.push({
            updateFormInfo: {
                info: { description: quiz.description },
                updateMask: 'description'
            }
        });
    }
    if (quiz.questions && quiz.questions.length > 0) {
        requests.push(...quiz.questions.map(q => {
            let item = { title: q.question };
            if (q.type === 'CHOICE' || q.type === 'MULTIPLE_CHOICE') {
                item.questionItem = {
                    question: {
                        required: true,
                        choiceQuestion: {
                            type: q.type === 'CHOICE' ? 'RADIO' : 'CHECKBOX',
                            options: q.options.map(opt => ({ value: opt.text })),
                            shuffle: false
                        }
                    }
                };
            } else if (q.type === 'TEXT') {
                item.questionItem = {
                    question: {
                        required: true,
                        textQuestion: {}
                    }
                };
            }
            return { createItem: { item, location: { index: 0 } } };
        }));
    }
    if (requests.length > 0) {
        await forms.forms.batchUpdate({
            formId,
            requestBody: { requests }
        });
    }

    // 3. Récupérer l'URL du formulaire
    const formUrl = `https://docs.google.com/forms/d/${formId}/viewform`;
    return { formId, formUrl };
}

module.exports = {
    async createQuiz(quizData, user, googleAuth) {
        console.log('Création quiz pour user:', user.email, 'googleAuth:', !!googleAuth, 'refreshToken:', user.refreshToken);
        let formId = null;
        let formUrl = null;
        if (googleAuth) {
            try {
                const res = await createGoogleFormQuiz(quizData, googleAuth);
                formId = res.formId;
                formUrl = res.formUrl;
                console.log('Google Form généré:', formUrl);
            } catch (err) {
                console.error('Erreur création Google Form:', err);
            }
        } else {
            console.warn('Pas de googleAuth, pas de Google Form généré');
        }
        const quiz = new Quiz({
            ...quizData,
            professor: user._id,
            isAvailable: true,
            googleFormId: formId,
            googleFormUrl: formUrl
        });
        await quiz.save();
        return quiz;
    },
    async getQuizById(id) {
        return Quiz.findById(id);
    },
    async getAllQuizzes({ availableOnly = false } = {}) {
        const filter = availableOnly ? { isAvailable: true } : {};
        return Quiz.find(filter);
    },
    async updateQuiz(id, updateData) {
        return Quiz.findByIdAndUpdate(id, updateData, { new: true });
    },
    async deleteQuiz(id) {
        return Quiz.findByIdAndDelete(id);
    },
    async getQuizzesByProf(profId) {
        return Quiz.find({ professor: profId });
    },
    // Pour l'étudiant : obtenir l'URL du Google Form pour répondre
    async getQuizFormUrl(id) {
        const quiz = await Quiz.findById(id);
        return quiz ? quiz.googleFormUrl : null;
    }
}; 