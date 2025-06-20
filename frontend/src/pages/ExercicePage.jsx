import { useEffect, useState } from 'react';

function ExercicePage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [professors, setProfessors] = useState([]);
  const [filters, setFilters] = useState({
    professor: '',
    category: ''
  });
  const [filterType, setFilterType] = useState('category'); // 'category' ou 'professor'
  const [stats, setStats] = useState({
    totalQuizAnswered: 0,
    totalPointsEarned: 0,
    quizzesByCategory: {}
  });
  const [activeQuiz, setActiveQuiz] = useState(null); // Pour le mode réponse
  const [userAnswers, setUserAnswers] = useState({}); // Stocke les réponses de l'utilisateur

  // Charger la liste des quiz disponibles
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/quizzes/available', { credentials: 'include' });
        if (!res.ok) throw new Error('Erreur de chargement des quiz');
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Charger la liste des professeurs
  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await fetch('/auth/professors', { credentials: 'include' });
        if (!res.ok) throw new Error('Erreur de chargement des professeurs');
        const data = await res.json();
        setProfessors(data);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    fetchProfessors();
  }, []);

  // Charger les statistiques de l'étudiant
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/quizzes/stats', { credentials: 'include' });
        if (!res.ok) throw new Error('Erreur de chargement des statistiques');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    fetchStats();
  }, []);

  // Filtrer les quiz
  const filteredQuizzes = quizzes.filter(quiz => {
    if (filterType === 'professor') {
      return !filters.professor || quiz.professor._id === filters.professor;
    } else {
      return !filters.category || quiz.category === filters.category;
    }
  });

  // DEBUG : afficher la liste des professeurs reçus
  console.log('professors:', professors);

  // Gérer la soumission d'un quiz
  const handleQuizSubmit = async (quizId, answers) => {
    try {
      const res = await fetch(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error('Erreur lors de la soumission');
      const result = await res.json();
      // Mettre à jour les stats
      setStats(prevStats => ({
        ...prevStats,
        totalQuizAnswered: prevStats.totalQuizAnswered + 1,
        totalPointsEarned: prevStats.totalPointsEarned + result.pointsEarned
      }));
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Liste des quiz et filtres */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setFilterType('category');
                setFilters({ professor: '', category: '' });
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterType === 'category'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Par catégorie
            </button>
            <button
              onClick={() => {
                setFilterType('professor');
                setFilters({ professor: '', category: '' });
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterType === 'professor'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Par professeur
            </button>
          </div>
          {filterType === 'professor' ? (
            <select
              value={filters.professor}
              onChange={e => setFilters(f => ({ ...f, professor: e.target.value }))}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Tous les professeurs</option>
              {professors.map(prof => (
                <option key={prof._id} value={prof._id}>{prof.nom || prof.email}</option>
              ))}
            </select>
          ) : (
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Toutes les catégories</option>
              {['Mathématiques', 'Français', 'Physique', 'Chimie'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid gap-4">
          {filteredQuizzes.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Aucun quiz trouvé pour ce filtre.</div>
          ) : (
            filteredQuizzes.map(quiz => (
              <div
                key={quiz._id}
                className="border border-purple-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-lg hover:bg-purple-50 transition group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-purple-700">{quiz.title}</h3>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">{quiz.category}</span>
                </div>
                <p className="text-gray-600 mb-2">{quiz.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Par: {quiz.professor?.nom || quiz.professor?.email || 'Prof inconnu'}
                  </span>
                  <div className="flex gap-2">
                    {quiz.googleFormUrl ? (
                      <a
                        href={quiz.googleFormUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Répondre via Google Form
                      </a>
                    ) : (
                      <button
                        className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                        onClick={() => setActiveQuiz(quiz)}
                      >
                        Répondre sur CoursWap
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modale de réponse au quiz */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveQuiz(null)}></div>
          <div className="relative z-10 w-full max-w-2xl animate-modal-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-purple-300 max-h-[80vh] overflow-y-auto">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold" onClick={() => setActiveQuiz(null)}>&times;</button>
              <h3 className="text-2xl font-bold mb-6 text-purple-700">{activeQuiz.title}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const result = await handleQuizSubmit(activeQuiz._id, userAnswers);
                if (result) {
                  setActiveQuiz(null);
                  setUserAnswers({});
                  // Afficher le résultat
                  alert(`Score: ${result.pointsEarned} points sur ${result.totalPoints}`);
                }
              }}>
                {activeQuiz.questions.map((q, idx) => (
                  <div key={idx} className="mb-6 border rounded-lg p-4 bg-purple-50">
                    <div className="font-semibold text-purple-800 mb-3">{idx + 1}. {q.question}</div>
                    {q.type === 'TEXT' ? (
                      <input
                        type="text"
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                        value={userAnswers[q._id] || ''}
                        onChange={e => setUserAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                      />
                    ) : q.type === 'CHOICE' ? (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <label key={i} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`question_${q._id}`}
                              value={opt.text}
                              checked={userAnswers[q._id] === opt.text}
                              onChange={e => setUserAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                              className="text-purple-600 focus:ring-purple-400"
                            />
                            <span>{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <label key={i} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={opt.text}
                              checked={userAnswers[q._id]?.includes(opt.text)}
                              onChange={e => {
                                const value = e.target.value;
                                setUserAnswers(prev => {
                                  const current = prev[q._id] || [];
                                  return {
                                    ...prev,
                                    [q._id]: e.target.checked
                                      ? [...current, value]
                                      : current.filter(v => v !== value)
                                  };
                                });
                              }}
                              className="text-purple-600 focus:ring-purple-400"
                            />
                            <span>{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      setActiveQuiz(null);
                      setUserAnswers({});
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Soumettre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExercicePage; 