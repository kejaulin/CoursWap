import { useEffect, useState, StrictMode } from 'react';
import Header from './Header';
import MainPage from './MainPage';

const service = process.env.DOMAIN+'/app';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${service}`)
      .then(res => res.json())
      .then(data => setMessage(data.temp));
  }, []);

  const [googleConnexionId, setConnexion] = useState('');
  useEffect( () => {
      fetch(`${process.env.DOMAIN+'/api/current_user'}`,{credentials:'include'})
        .then(res => res.json())
        .then(user => setConnexion(user.googleId));
  }, []);

  let connexionId = googleConnexionId;

  return (
    <StrictMode>
      <Header connexionId={connexionId}/>
      <MainPage connexionId={connexionId}/>
    </StrictMode> 
  );
}

export default App;
