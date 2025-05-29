import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import moment from 'moment';

const clientId = "882025545288-d6jj90v0tlq2fm0rprshbvc1gfegvsvp.apps.googleusercontent.com";

function CalendarSlotPicker() {
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialisation de l'API 

  useEffect(() => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events'
      });
    });
  }, []);

  // Recuperer les creneaux libres en fonction de Google Calendar 

  const fetchAvailableSlots = async () => {
    if (!date) return;

    // Auth Google 
    const auth = gapi.auth2.getAuthInstance();
    const user = await auth.signIn();
    const accessToken = user.getAuthResponse().access_token;
    gapi.client.setToken({ access_token: accessToken });

    setLoading(true);
    await gapi.client.load('calendar', 'v3');
    // Choisir la journée sélectionnée

    const timeMin = moment(date).startOf('day').toISOString();
    const timeMax = moment(date).endOf('day').toISOString();

    // Freebusy pour svoir les plages occupées
    const response = await gapi.client.calendar.freebusy.query({
      timeMin,
      timeMax,
      timeZone: 'Europe/Paris',
      items: [{ id: 'primary' }]
    });

    const busySlots = response.result.calendars.primary.busy.map(b => ({
      start: moment(b.start),
      end: moment(b.end)
    }));

    // Generer les creneux de 2h

    const generatedSlots = [];

    let slot = moment(date).hour(8).minute(0);
    const endOfDay = moment(date).hour(18);

    while (slot.isBefore(endOfDay)) {
      const start = slot.clone();
      const end = slot.clone().add(2, 'hour');

      const isBusy = busySlots.some(busy =>
        start.isBefore(busy.end) && end.isAfter(busy.start)
      );

      if (!isBusy) {
        generatedSlots.push({
          start: start.clone(),
          end: end.clone()
        });
      }

      slot.add(1, 'hour');
    }

    setAvailableSlots(generatedSlots);
    setLoading(false);
  };

  // Creation de l'evenement dans le Google Calendar 

  const createEvent = async (slot) => {
    await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: 'CoursWap - Réservation',
        start: {
          dateTime: slot.start.toISOString(),
          timeZone: 'Europe/Paris'
        },
        end: {
          dateTime: slot.end.toISOString(),
          timeZone: 'Europe/Paris'
        }
      }
    }).then(() => {
      alert(`Événement réservé pour ${slot.start.format("HH:mm")} - ${slot.end.format("HH:mm")}`);
    }).catch(err => {
      console.error('Erreur lors de la création :', err);
    });
  };

  return (
    <div>
      <h2>Choisis une date pour voir les créneaux disponibles</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={fetchAvailableSlots}>Vérifier les créneaux</button>

      {loading && <p>Chargement des créneaux...</p>}

      {availableSlots.length > 0 && (
        <ul>
          {availableSlots.map((slot, index) => (
            <li key={index}>
              {slot.start.format("HH:mm")} - {slot.end.format("HH:mm")}
              <button onClick={() => createEvent(slot)}>Réserver</button>
            </li>
          ))}
        </ul>
      )}

      {!loading && date && availableSlots.length === 0 && (
        <p>Aucun créneau disponible ce jour-là.</p>
      )}
    </div>
  );
}

export default CalendarSlotPicker;
