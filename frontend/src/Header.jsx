import { useAuth } from './component/AuthProvider';
import { useNavigate } from "react-router-dom";
import { UserPlusIcon } from '@heroicons/react/24/solid';

function Header(){

  const handleLogout = ()=>{
    fetch('/api/auth/logout',{
        credentials:'include',
        method:'POST',
    }).then(()=>{
        window.location.href="/";
    })
  };

  const handleLogin = ()=>{
    window.location.href="/loginPage";
  };

  const handleGoBackHome = ()=>{
    window.location.href="/";
  };

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  return(
        <header className="flex justify-between items-center p-2 shadow-md h-20"> 
            <div className="flex items-center space-x-2 h-full">
                <img onClick={handleGoBackHome} src="./../img/appLogo.png" alt="Courswap Logo" className="object-cover w-full h-full hover:cursor-pointer"/>
            </div>
            {!user ?
                <div className="inline-flex">
                    <button onClick={handleLogin} className="border px-4 py-1 rounded-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">Connexion</button>
                </div>
            :
            <div className="inline-flex items-center gap-4">
                {/* Icône Créer Profil */}
                <button onClick={() => navigate('/profil')} className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-xl px-4 py-2 transition">
                    <UserPlusIcon className="w-6 h-6" />
                    <span>Profil</span>
                </button>
                <button onClick={handleLogout} className="border px-4 py-1 rounded-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">Déconnexion</button>
            </div>
            }
        </header>
  );
};

export default Header;