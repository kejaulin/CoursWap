import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Mathématiques', 'Francais', 'Histoire', 'Géographie'];
const QUESTION_TYPES = ['CHOICE', 'TEXT', 'MULTIPLE_CHOICE'];

function GererQuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    questions: []
  });
  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'CHOICE',
    options: [{ text: '', isCorrect: false }],
    correctAnswer: '',
    points: 1
  });
  const [editQuestionIdx, setEditQuestionIdx] = useState(null);
  const [mode, setMode] = useState('list'); // 'list' ou 'form'
  const [creationMode, setCreationMode] = useState(null); // 'courswap' | 'googleform' | null
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const navigate = useNavigate();

  // Charger les quiz du prof
  useEffect(() => {
    fetch('/quizzes/my', { credentials: 'include' })
      .then(res => res.json())
      .then(setQuizzes)
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [showForm]);

  // Empêche le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (selectedQuiz) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedQuiz]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce quiz ?')) return;
    await fetch(`/quizzes/${id}`, { method: 'DELETE', credentials: 'include' });
    setQuizzes(q => q.filter(quiz => quiz._id !== id));
  };

  const handleEdit = (quiz) => {
    setEditQuiz(quiz);
    setForm({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      questions: quiz.questions || [],
      googleFormUrl: quiz.googleFormUrl || ''
    });
    setShowForm(true);
    setMode('form');
    setCreationMode(quiz.googleFormUrl ? 'googleform' : 'courswap');
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Gestion des questions
  const resetQuestionForm = () => setQuestionForm({
    question: '',
    type: 'CHOICE',
    options: [{ text: '', isCorrect: false }],
    correctAnswer: '',
    points: 1
  });

  const handleQuestionChange = e => {
    setQuestionForm(q => ({ ...q, [e.target.name]: e.target.value }));
  };

  const handleOptionChange = (idx, field, value) => {
    setQuestionForm(q => {
      const options = q.options.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt);
      return { ...q, options };
    });
  };

  const addOption = () => {
    setQuestionForm(q => ({ ...q, options: [...q.options, { text: '', isCorrect: false }] }));
  };

  const removeOption = (idx) => {
    setQuestionForm(q => ({ ...q, options: q.options.filter((_, i) => i !== idx) }));
  };

  const handleAddOrEditQuestion = () => {
    // Validation simple : question non vide, points >= 1, options si besoin
    if (!questionForm.question.trim()) return setError('Intitulé de la question requis');
    if (!questionForm.points || isNaN(questionForm.points) || questionForm.points < 1) return setError('Points requis (>=1)');
    if ((questionForm.type === 'CHOICE' || questionForm.type === 'MULTIPLE_CHOICE')) {
      if (!questionForm.options || questionForm.options.length < 2) return setError('Au moins 2 options requises');
      if (!questionForm.options.some(opt => opt.isCorrect)) return setError('Au moins une option correcte requise');
    }
    if (editQuestionIdx !== null) {
      setForm(f => {
        const questions = [...f.questions];
        questions[editQuestionIdx] = questionForm;
        return { ...f, questions };
      });
      setEditQuestionIdx(null);
    } else {
      setForm(f => ({ ...f, questions: [...f.questions, questionForm] }));
    }
    resetQuestionForm();
    setError('');
  };

  const handleEditQuestion = idx => {
    setEditQuestionIdx(idx);
    setQuestionForm(form.questions[idx]);
  };

  const handleDeleteQuestion = idx => {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.questions || form.questions.length === 0) {
      setError('Ajoutez au moins une question au quiz.');
      return;
    }
    setError('');
    const method = editQuiz ? 'PUT' : 'POST';
    const url = editQuiz ? `/quizzes/${editQuiz._id}` : '/quizzes';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setShowForm(false);
      setEditQuiz(null);
      setForm({ title: '', description: '', category: '', questions: [] });
      setMode('list');
      setCreationMode(null);
      // recharge la liste
      fetch('/quizzes/my', { credentials: 'include' })
        .then(res => res.json())
        .then(setQuizzes);
    } else {
      setError('Erreur lors de la sauvegarde');
    }
  };

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Gérer mes Quiz</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex gap-4 mb-4">
        <button
          className={`bg-green-500 text-white px-4 py-2 rounded ${mode === 'form' && creationMode === 'courswap' ? 'opacity-50' : ''}`}
          onClick={() => { setShowForm(true); setEditQuiz(null); setForm({ title: '', description: '', category: '', questions: [] }); setMode('form'); setCreationMode('courswap'); }}
          disabled={mode === 'form' && creationMode === 'courswap'}
        >
          Nouveau Quiz
        </button>
        <button
          className={`bg-gray-500 text-white px-4 py-2 rounded ${mode === 'list' ? 'opacity-50' : ''}`}
          onClick={() => { setShowForm(false); setEditQuiz(null); setMode('list'); setCreationMode(null); }}
          disabled={mode === 'list'}
        >
          Consulter mes quiz
        </button>
      </div>
      {showForm && mode === 'form' && creationMode === 'courswap' && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-purple-300 shadow-xl rounded-2xl p-8 mb-6 max-w-2xl mx-auto animate-modal-slide-down">
          <h3 className="text-xl font-bold text-purple-700 mb-6">{editQuiz ? 'Modifier le Quiz' : 'Créer un nouveau Quiz'}</h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Titre</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Titre" className="block p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Description</label>
            <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="block p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-1 text-gray-700">Catégorie</label>
            <select name="category" value={form.category} onChange={handleChange} className="block p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required>
              <option value="">Choisir une catégorie</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="mb-8">
            <h4 className="font-semibold mb-3 text-purple-600 text-lg">Questions</h4>
            <ul className="mb-3">
              {form.questions.map((q, idx) => (
                <li key={idx} className="mb-2 border p-3 rounded-lg flex justify-between items-center bg-purple-50">
                  <span className="font-medium">{q.question} <span className="text-xs text-gray-500">({q.type})</span></span>
                  <span>
                    <button type="button" className="text-blue-600 hover:underline mr-2" onClick={() => handleEditQuestion(idx)}>Éditer</button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => handleDeleteQuestion(idx)}>Supprimer</button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 p-4 rounded-xl mb-2 border border-purple-100">
              <div className="mb-2">
                <label className="block font-semibold mb-1 text-gray-700">Intitulé de la question</label>
                <input name="question" value={questionForm.question} onChange={handleQuestionChange} placeholder="Intitulé de la question" className="block p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div className="mb-2">
                <label className="block font-semibold mb-1 text-gray-700">Type</label>
                <select name="type" value={questionForm.type} onChange={handleQuestionChange} className="block p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-purple-300">
                  {QUESTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              {(questionForm.type === 'CHOICE' || questionForm.type === 'MULTIPLE_CHOICE') && (
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-gray-700">Options</label>
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 mb-1 items-center">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={e => handleOptionChange(idx, 'text', e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="p-2 border rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type={questionForm.type === 'CHOICE' ? 'radio' : 'checkbox'}
                          checked={opt.isCorrect}
                          onChange={e => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                          name="isCorrectOption"
                        />
                        <span className="text-xs">Correcte</span>
                      </label>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => removeOption(idx)}>Suppr</button>
                    </div>
                  ))}
                  <button type="button" className="text-green-600 hover:underline mt-1" onClick={addOption}>Ajouter une option</button>
                </div>
              )}
              <div className="mb-2">
                <label className="block font-semibold mb-1 text-gray-700">Bonne réponse (texte ou option)</label>
                <input name="correctAnswer" value={questionForm.correctAnswer} onChange={handleQuestionChange} placeholder="Bonne réponse" className="block p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div className="mb-2">
                <label className="block font-semibold mb-1 text-gray-700">Points</label>
                <input name="points" type="number" min="1" value={questionForm.points} onChange={handleQuestionChange} placeholder="Points" className="block p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-purple-300" required />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
                  onClick={handleAddOrEditQuestion}
                >
                  {editQuestionIdx !== null ? 'Modifier' : 'Ajouter'} la question
                </button>
                {editQuestionIdx !== null && <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setEditQuestionIdx(null); resetQuestionForm(); }}>Annuler</button>}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow">{editQuiz ? 'Modifier' : 'Créer'}</button>
            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold" onClick={() => { setShowForm(false); setMode('list'); setCreationMode(null); }}>Annuler</button>
          </div>
        </form>
      )}
      {showForm && mode === 'form' && creationMode === 'googleform' && (
        <form onSubmit={async e => {
          e.preventDefault();
          if (!form.title || !form.category || !form.googleFormUrl) {
            setError('Remplis tous les champs et colle le lien du Google Form.');
            return;
          }
          setError('');
          const method = editQuiz ? 'PUT' : 'POST';
          const url = editQuiz ? `/quizzes/${editQuiz._id}` : '/quizzes';
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              title: form.title,
              description: form.description,
              category: form.category,
              questions: [],
              googleFormUrl: form.googleFormUrl
            })
          });
          if (res.ok) {
            setShowForm(false);
            setEditQuiz(null);
            setForm({ title: '', description: '', category: '', questions: [], googleFormUrl: '' });
            setMode('list');
            setCreationMode(null);
            fetch('/quizzes/my', { credentials: 'include' })
              .then(res => res.json())
              .then(setQuizzes);
          } else {
            setError('Erreur lors de la sauvegarde');
          }
        }} className="bg-white border-2 border-purple-300 shadow-xl rounded-2xl p-8 mb-6 max-w-2xl mx-auto animate-modal-slide-down">
          <h3 className="text-xl font-bold text-purple-700 mb-6">{editQuiz ? 'Modifier le Quiz Google Form' : 'Ajouter un Quiz Google Form'}</h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Titre</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Titre" className="block p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Description</label>
            <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="block p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Catégorie</label>
            <select name="category" value={form.category} onChange={handleChange} className="block p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required>
              <option value="">Choisir une catégorie</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-1 text-gray-700">Lien Google Form</label>
            <input name="googleFormUrl" value={form.googleFormUrl || ''} onChange={e => setForm(f => ({ ...f, googleFormUrl: e.target.value }))} placeholder="Lien Google Form (coller ici après création)" className="block p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" required />
          </div>
          <div className="flex gap-4 mt-6">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow">{editQuiz ? 'Modifier' : 'Créer'}</button>
            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold" onClick={() => { setShowForm(false); setMode('list'); setCreationMode(null); }}>Annuler</button>
          </div>
        </form>
      )}
      {mode === 'list' && (
        <ul className="space-y-4">
          {quizzes.map(quiz => (
            <li
              key={quiz._id}
              className="border border-purple-200 rounded-xl p-5 flex justify-between items-center bg-white shadow-sm hover:shadow-lg hover:bg-purple-50 transition cursor-pointer group"
              onClick={() => setSelectedQuiz(quiz)}
            >
              <div className="flex-1">
                <div className="font-bold text-lg text-purple-800 group-hover:underline">{quiz.title}</div>
                <div className="text-gray-600 mb-1">{quiz.description}</div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Catégorie : {quiz.category}</span>
                  <span>Créé le : {quiz.createdAt ? new Date(quiz.createdAt).toLocaleString() : ''}</span>
                  <span>Google Form : {quiz.googleFormUrl ? <a href={quiz.googleFormUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ouvrir</a> : <span className="italic text-gray-400">Non généré</span>}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="bg-yellow-400 px-3 py-1 rounded shadow hover:bg-yellow-300" onClick={e => { e.stopPropagation(); handleEdit(quiz); }}>Modifier</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-400" onClick={e => { e.stopPropagation(); handleDelete(quiz._id); }}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 opacity-100" onClick={() => setSelectedQuiz(null)}></div>
          {/* Modale centrée avec animation slide-down/fade */}
          <div className="relative z-10 w-full max-w-2xl animate-modal-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-purple-300 transition-all duration-300 transform">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold" onClick={() => setSelectedQuiz(null)}>&times;</button>
              <h3 className="text-2xl font-bold mb-2 text-purple-700">{selectedQuiz.title}</h3>
              <div className="mb-2 text-lg text-gray-700 font-medium">{selectedQuiz.description}</div>
              <div className="mb-2 text-sm text-gray-600"><span className="font-semibold">Catégorie :</span> {selectedQuiz.category}</div>
              <div className="mb-2 text-sm text-gray-600"><span className="font-semibold">Créé le :</span> {selectedQuiz.createdAt ? new Date(selectedQuiz.createdAt).toLocaleString() : ''}</div>
              <div className="mb-2 text-sm text-gray-600"><span className="font-semibold">Google Form :</span> {selectedQuiz.googleFormUrl ? <a href={selectedQuiz.googleFormUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ouvrir</a> : <span className="italic text-gray-400">Non généré</span>}</div>
              <div className="mt-6">
                <h4 className="text-xl font-semibold mb-3 text-purple-600 border-b pb-1">Questions</h4>
                {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                  <ul className="space-y-4">
                    {selectedQuiz.questions.map((q, idx) => (
                      <li key={idx} className="border rounded p-4 bg-purple-50">
                        <div className="font-semibold text-purple-800 mb-1">{idx + 1}. {q.question} <span className="text-xs text-gray-500">({q.type})</span></div>
                        {q.options && q.options.length > 0 && (
                          <ul className="ml-4 text-sm mb-1">
                            {q.options.map((opt, i) => (
                              <li key={i} className={opt.isCorrect ? 'text-green-700 font-bold' : 'text-gray-700'}>
                                <span className="inline-block w-4">{String.fromCharCode(65 + i)}.</span> {opt.text} {opt.isCorrect && <span className="ml-1">✔</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="text-xs text-gray-600"><span className="font-semibold">Bonne réponse :</span> {q.correctAnswer}</div>
                        <div className="text-xs text-gray-600"><span className="font-semibold">Points :</span> {q.points}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">Aucune question enregistrée.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GererQuizPage; 