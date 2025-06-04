import { StrictMode, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContactProfesseur from './pages/ContactProfesseur';import Header from './Header';
import MainPage from './MainPage';

const service = process.env.DOMAIN + '/app';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${service}`)
      .then(res => res.json())
      .then(data => setMessage(data.temp));
  }, []);

  const [googleConnexionId, setConnexion] = useState('');
  useEffect( () => {
      fetch(`${process.env.DOMAIN+'/api/auth/current_user'}`,{credentials:'include'})
        .then(res => res.json())
        .then(user => setConnexion(user.googleId));
  }, []);

  let connexionId = googleConnexionId;

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
          <Route path="*" element={<MainPage connexionId={connexionId} />} />
        </Routes>
        }
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
