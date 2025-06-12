import { useState, useEffect } from 'react';
import { useAuth } from '../component/AuthProvider';

function QuizManager() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        title: '',
        description: '',
        category: '',
        questions: []
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        type: 'CHOICE',
        options: [{ text: '', isCorrect: false }],
        correctAnswer: '',
        points: 1
    });

    // Liste des catégories disponibles
    const categories = ['Mathématiques', 'Français', 'Anglais', 'Histoire', 'Géographie', 'Sciences'];

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch('/api/quizzes?myQuizzes=true', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setQuizzes(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des quiz:', error);
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newQuiz)
            });
            if (response.ok) {
                setIsCreating(false);
                setNewQuiz({
                    title: '',
                    description: '',
                    category: '',
                    questions: []
                });
                fetchQuizzes();
            }
        } catch (error) {
            console.error('Erreur lors de la création du quiz:', error);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
            try {
                const response = await fetch(`/api/quizzes/${quizId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    fetchQuizzes();
                }
            } catch (error) {
                console.error('Erreur lors de la suppression du quiz:', error);
            }
        }
    };

    const addQuestion = () => {
        // Vérifier qu'il y a une seule réponse correcte
        const correctOptions = currentQuestion.options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
            alert('Veuillez sélectionner exactement une réponse correcte');
            return;
        }

        // Mettre à jour correctAnswer avec le texte de l'option correcte
        const correctOption = correctOptions[0];
        const updatedQuestion = {
            ...currentQuestion,
            correctAnswer: correctOption.text
        };

        setNewQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, updatedQuestion]
        }));
        setCurrentQuestion({
            question: '',
            type: 'CHOICE',
            options: [{ text: '', isCorrect: false }],
            correctAnswer: '',
            points: 1
        });
    };

    const addOption = () => {
        setCurrentQuestion(prev => ({
            ...prev,
            options: [...prev.options, { text: '', isCorrect: false }]
        }));
    };

    const handleOptionCorrectChange = (index) => {
        setCurrentQuestion(prev => {
            const newOptions = prev.options.map((opt, i) => ({
                ...opt,
                isCorrect: i === index // Un seul choix correct
            }));
            return {
                ...prev,
                options: newOptions
            };
        });
    };

    if (!user) {
        return <div>Veuillez vous connecter pour accéder à cette page.</div>;
    }

    return (
        <div className="font-sans flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold mb-6">Gestion des Quiz</h1>
            
            {!isCreating ? (
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-purple-700"
                >
                    Créer un nouveau quiz
                </button>
            ) : (
                <div className="bg-purple-200 rounded-3xl p-6 w-full max-w-4xl mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Créer un nouveau quiz</h2>
                    <form onSubmit={handleCreateQuiz} className="space-y-4">
                        <div>
                            <label className="block mb-2">Titre</label>
                            <input
                                type="text"
                                value={newQuiz.title}
                                onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-2 rounded border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Description</label>
                            <textarea
                                value={newQuiz.description}
                                onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full p-2 rounded border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Catégorie</label>
                            <input
                                type="text"
                                value={newQuiz.category}
                                onChange={(e) => setNewQuiz(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-2 rounded border"
                                required
                            />
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-xl font-semibold mb-4">Ajouter une question</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2">Question</label>
                                    <input
                                        type="text"
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                        className="w-full p-2 rounded border"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2">Type de question</label>
                                    <select
                                        value={currentQuestion.type}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full p-2 rounded border"
                                    >
                                        <option value="CHOICE">Choix unique</option>
                                        <option value="MULTIPLE_CHOICE">Choix multiples</option>
                                        <option value="TEXT">Réponse libre</option>
                                    </select>
                                </div>
                                {currentQuestion.type !== 'TEXT' && (
                                    <div>
                                        <label className="block mb-2">Options</label>
                                        {currentQuestion.options.map((option, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => {
                                                        const newOptions = [...currentQuestion.options];
                                                        newOptions[index].text = e.target.value;
                                                        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                                                    }}
                                                    className="flex-1 p-2 rounded border"
                                                    placeholder="Option"
                                                />
                                                <input
                                                    type="checkbox"
                                                    checked={option.isCorrect}
                                                    onChange={(e) => {
                                                        const newOptions = [...currentQuestion.options];
                                                        newOptions[index].isCorrect = e.target.checked;
                                                        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                                                    }}
                                                    className="w-6 h-6"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg mt-2"
                                        >
                                            Ajouter une option
                                        </button>
                                    </div>
                                )}
                                <div>
                                    <label className="block mb-2">Points</label>
                                    <input
                                        type="number"
                                        value={currentQuestion.points}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                                        className="w-full p-2 rounded border"
                                        min="1"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Ajouter la question
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                            >
                                Créer le quiz
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4">Mes Quiz</h2>
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <div key={quiz._id} className="bg-purple-200 rounded-3xl p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">{quiz.title}</h3>
                                    <p className="text-gray-600">{quiz.description}</p>
                                    <p className="text-sm text-gray-500">Catégorie: {quiz.category}</p>
                                    <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteQuiz(quiz._id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default QuizManager; 