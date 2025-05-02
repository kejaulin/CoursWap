import { useEffect, useState, StrictMode } from 'react';


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
      <div>
        <h1>test1133223</h1>
        <h2>{message}</h2>
      </div>
    </StrictMode> 
  );
}

export default App;
