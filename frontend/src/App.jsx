import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import GCalendar from './components/calendar/GCalendar';
import CalendarSlotPicker from './components/calendar/CalendarSlotPicker';
import ContactProfesseur from './pages/ContactProfesseur';

const service = process.env.DOMAIN + '/app';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${service}`)
      .then(res => res.json())
      .then(data => setMessage(data.temp));
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <h1>test Frontend </h1>
            <h2>{message}</h2>
          </div>
        }
      />
      <Route path="/profs/:id" element={<ContactProfesseur />} />
    </Routes>
  );
}

export default App;
