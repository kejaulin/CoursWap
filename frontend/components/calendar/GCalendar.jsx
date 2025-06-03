import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const clientId = "882025545288-d6jj90v0tlq2fm0rprshbvc1gfegvsvp.apps.googleusercontent.com";

function GCalendar() {
  const [form, setForm] = useState({
    summary: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.client.init({
        clientId,
        scope: "https://www.googleapis.com/auth/calendar.events"
      });
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = gapi.auth2.getAuthInstance();
    const user = await auth.signIn();
    const accessToken = user.getAuthResponse().access_token;

    gapi.client.setToken({ access_token: accessToken });

    const event = {
      summary: form.summary,
      start: {
        dateTime: `${form.date}T${form.startTime}:00`,
        timeZone: "Europe/Paris"
      },
      end: {
        dateTime: `${form.date}T${form.endTime}:00`,
        timeZone: "Europe/Paris"
      }
    };

    gapi.client.load('calendar', 'v3', () => {
      gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      }).then(() => {
        alert(' Événement ajouté à Google Calendar !');
      }).catch(err => {
        console.error('Erreur :', err);
      });
    });
  };

  return (
    <div>
      <h2>Créer un événement Google Calendar</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="summary" placeholder="Titre de l'événement" onChange={handleChange} required />
        <input type="date" name="date" onChange={handleChange} required />
        <input type="time" name="startTime" onChange={handleChange} required />
        <input type="time" name="endTime" onChange={handleChange} required />
        <button type="submit">Ajouter à Google Calendar</button>
      </form>
    </div>
  );
}

export default GCalendar;
