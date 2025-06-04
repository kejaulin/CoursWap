import { StrictMode, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContactProfesseur from './pages/ContactProfesseur';import Header from './Header';
import MainPage from './MainPage';
import LoginRegister from './pages/LoginRegister';

const service = process.env.DOMAIN + '/app';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${service}`)
      .then(res => res.json())
      .then(data => setMessage(data.temp));
  }, []);

  const [connexionId, setConnexion] = useState('');
  useEffect( () => {
      fetch(`${process.env.DOMAIN+'/api/auth/current_user'}`,{credentials:'include'})
        .then(res => res.json())
        .then(user => setConnexion(user._id));
  }, []);

  return (
    <StrictMode>
      <Header connexionId={connexionId}/>
      <BrowserRouter>
        { connexionId != undefined ?
          <Routes>
            <Route path="/" element={<MainPage connexionId={connexionId} />} />
            <Route path="/profs/:id" element={<ContactProfesseur />} />
          </Routes>
        :
        <Routes>
          <Route path="/loginPage" element={<LoginRegister />} />
          <Route path="*" element={window.location.pathname !== "/loginPage" ? <MainPage connexionId={connexionId} /> : <div />} />
        </Routes>
        }
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
