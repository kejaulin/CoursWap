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

  return (
    <StrictMode>
      <Header/>
      <MainPage/>
    </StrictMode> 
  );
}

export default App;
