function Header({connexionId}){
  const handleLogout = ()=>{
    fetch('/api/auth/logout',{
        credentials:'include',
        method:'POST',
    }).then(()=>{
        window.location.href="/";
    })
  };

  const handleLogin = ()=>{
    window.location.href="/api/auth/google";
  };

  return(
        <header className="flex justify-between items-center p-2 shadow-md h-20">
            <div className="flex items-center space-x-2 h-full">
                <img src="./../img/appLogo.png" alt="Courswap Logo" className="object-cover w-full h-full hover:cursor-pointer"/>
            </div>
            {connexionId == undefined ?
                <div className="inline-flex">
                    <button onClick={handleLogin} className="border px-4 py-1 mr-1 rounded-full flex items-center space-x-2 hover:bg-blue-600 hover:cursor-pointer">
                        <img src="./../img/Google.svg" alt="Google connection" className="w-4 h-4"/>
                    </button>
                    <a href="/api/auth/google" className="border px-4 py-1 rounded-l-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">Se connecter</a>
                    <button className="border px-4 py-1 rounded-r-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">S'inscrire</button>
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