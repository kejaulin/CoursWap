import { useEffect, useState, StrictMode } from 'react';
import GCalendar from './components/calendar/GCalendar'
import CalendarSlotPicker from './components/calendar/CalendarSlotPicker';
import { Routes, Route } from 'react-router-dom';
import ContactProfesseur from './pages/ContactProfesseur';

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
        <h1>CoursWap - Créneaux disponibles</h1>
      <CalendarSlotPicker />
      </div>
        <Routes>
        <Route path="/" element={
          <div>
            <h1>test1133223</h1>
            <h2>{message}</h2>
          </div>
        } />
        <Route path="/profs/:id" element={<ContactProfesseur />} />
      </Routes>
    </StrictMode> 
  );
  
}

export default App;
