import React, { useState } from 'react';

const LoginRegister = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const endpoint = mode === 'login' ? 'api/auth/login' : '/api/auth/register';
    try {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      }).then(async (res) => {
            if (!res.ok) {
                if(res.status === 400) 
                {
                    setError((await res.json()).message);
                    throw new Error('Impossible de créer l\'utilisateur');
                } else if(res.status === 401){
                    setError((await res.json()).message);
                    throw new Error('Email ou mot de passe incorrect');   
                }
                const err = res.text();
                throw new Error(err);
            }
            window.location.href = '/';
        });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href="/api/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </form>

        <div className="flex items-center justify-center">
          <span className="text-gray-500">ou</span>
        </div>

        <button onClick={handleGoogleLogin} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <img src="./../img/Google.svg" alt="Google connection" className="w-4 h-4 mr-2"/>
            <span>Se connecter avec Google</span>
        </button>

        {error && (
          <p className="mt-2 text-sm text-center text-red-500">{error}</p>
        )}

        <div className="text-center">
          {mode === 'login' ? (
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <button onClick={() => setMode('register')} className="text-blue-600 hover:underline">
                S'inscrire
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Déjà inscrit ?{' '}
              <button onClick={() => setMode('login')} className="text-blue-600 hover:underline">
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
