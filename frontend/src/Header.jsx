import React from 'react';

const Header = ()=> (
    <header className="flex justify-between items-center p-2 shadow-md h-20">
        <div className="flex items-center space-x-2 h-full">
            <img src="./../img/appLogo.png" alt="Courswap Logo" className="object-cover w-full h-full hover:cursor-pointer"/>
        </div>
        <div className="inline-flex">
            <button className="border px-4 py-1 rounded-l-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">Se connecter</button>
            <button className="border px-4 py-1 rounded-r-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer font-bold">S'inscrire</button>
        </div>
    </header>
);

export default Header;