import { useAuth } from './component/AuthProvider';

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

  const { user, logout } = useAuth();

  return(
        <header className="flex justify-between items-center p-2 shadow-md h-20"> 
            <div className="flex items-center space-x-2 h-full">
                <img src="./../img/appLogo.png" alt="Courswap Logo" className="object-cover w-full h-full hover:cursor-pointer"/>
            </div>
            {!user ?
                <div className="inline-flex">
                    <button onClick={handleLogin} className="border px-4 py-1 rounded-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">Connexion</button>
                </div>
            :
            <div className="inline-flex">
                <button onClick={handleLogout} className="border px-4 py-1 rounded-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">Déconnexion</button>
            </div>
            }
        </header>
  );
};

export default Header;