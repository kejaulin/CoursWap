import { useEffect, useState, StrictMode } from 'react';
import GCalendar from './components/calendar/GCalendar'
import CalendarSlotPicker from './components/calendar/CalendarSlotPicker';

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
    </StrictMode> 
  );
  
}

export default App;
