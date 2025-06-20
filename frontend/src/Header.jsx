import { useAuth } from './component/AuthProvider';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000');

function Header() {
  const [tokens, setTokens] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      navigate(0);
    });
  };

  useEffect(() => {
    if (!user?._id) return;

    let subscribedAppId = null;

    const fetchAppInfos = async () => {
      try {
        const res = await fetch('/api/auth/appinfos', {
          credentials: 'include',
          method: 'GET',
        });
        const appInfos = (await res.json())[0];
        if (appInfos?._id) {
          subscribedAppId = appInfos._id;
          socket.emit('subscribeToApp', subscribedAppId);

          // Récupération initiale
          const tokensRes = await fetch(`/api/users/${user._id}/tokens`);
          const tokens = await tokensRes.json();
          setTokens(tokens);

          // Écoute de l'événement WebSocket
          socket.on('tokens_regenerated', ({ regeneratedAt }) => {
            fetch(`/api/users/${user._id}/tokens`)
              .then(res => res.json())
              .then(tokens => {
                setTokens(tokens);
              });
          });
        }
      } catch (error) {
        console.error('Récupération appInfos échouée:', error);
      }
    };

    fetchAppInfos();

    return () => {
      socket.off('tokens_regenerated');
      if (subscribedAppId) {
        socket.emit('unsubscribeFromApp', subscribedAppId);
      }
    };
  }, [user]);

  return (
    <header className="flex justify-between items-center p-2 shadow-md h-20">
      <div className="flex items-center space-x-2 h-full">
        <img onClick={() => navigate("/")} src="./../img/appLogo.png" alt="Courswap Logo" className="object-cover w-full h-full hover:cursor-pointer" />
      </div>
      <div className="flex justify-between items-center px-6 py-3 bg-white">
        {!user ? (
          <div className="inline-flex">
            <button
              onClick={() => navigate('/loginPage')}
              className="border px-4 py-1 rounded-2xl hover:bg-blue-600 hover:text-white font-bold"
            >
              Connexion
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-orange-100 text-orange-700 font-semibold rounded-xl px-4 py-2">
              <img src="./../img/token.png" alt="SwapTokens logo" className="w-5 h-5" />
              <span className="hidden sm:inline whitespace-nowrap">SwapTokens:</span>
              <span>{tokens}</span>
            </div>

            <div className="sm:block h-8 border-l-1 border-gray-400 mx-4"></div>
            <div className="inline-flex items-center gap-4">
              {user.role === 'professeur' && (
                <button
                  onClick={() => navigate('/gerer-quiz')}
                  className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-xl px-4 py-2 transition"
                >
                  Gérer Quiz
                </button>
              )}
              {user.role === 'etudiant' && (
                <button
                  onClick={() => navigate('/exercices')}
                  className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-xl px-4 py-2 transition"
                >
                  S'exercer
                </button>
              )}
              <button
                onClick={() => navigate('/profil')}
                className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-xl px-4 py-2 transition"
              >
                <UserPlusIcon className="w-6 h-6" />
                <span className="hidden sm:inline whitespace-nowrap">Profil</span>
              </button>
              <button
                onClick={handleLogout}
                className="border px-4 py-1 rounded-2xl hover:bg-blue-600 hover:text-white font-bold"
              >
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;