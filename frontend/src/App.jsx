import { StrictMode, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContactProfesseur from './pages/ContactProfesseur';import Header from './Header';
import MainPage from './MainPage';
import LoginRegister from './pages/LoginRegister';
import { useAuth } from './component/AuthProvider';

import GMAP from './gMapImp/gMap';

function App() {
  const { user, logout } = useAuth();

  return (
    <StrictMode>
      <Header/>
      <GMAP/>
      <BrowserRouter>
        { user ?
          <Routes>
            <Route path="/" element={<MainPage/>} />
            <Route path="/profs/:id" element={<ContactProfesseur />} />
          </Routes>
        :
        <Routes>
          <Route path="/loginPage" element={<LoginRegister />} />
          <Route path="*" element={window.location.pathname !== "/loginPage" ? <MainPage/> : <div />} />
        </Routes>
        }
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
