import { useAuth } from './component/AuthProvider';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/solid';

function Header(){

  const [tokens, setTokens] = useState(0); 
  const handleLogout = ()=>{
    fetch('/api/auth/logout',{
        credentials:'include',
        method:'POST',
    }).then(()=>{
        window.location.href="/";
    })
  };

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user._id}/tokens`)
      .then(res => res.json())
      .then(tokens => {
        setTokens(tokens);
      });
    }
  },[user]);

  return(
    <header className="flex justify-between items-center p-2 shadow-md h-20"> 
      <div className="flex items-center space-x-2 h-full">
        <img onClick={() => navigate("/")} src="./../img/appLogo.png" alt="Courswap Logo" className="object-cover w-full h-full hover:cursor-pointer"/>
      </div>
      <div className="flex justify-between items-center px-6 py-3 bg-white">

        {!user ? (
          <div className="inline-flex">
            <button
              onClick={()=> navigate('/loginPage')}
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