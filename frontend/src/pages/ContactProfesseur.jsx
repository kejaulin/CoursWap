import { useParams } from 'react-router-dom';
import '../style/style.css';
import { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import moment from 'moment';

const clientId = "882025545288-d6jj90v0tlq2fm0rprshbvc1gfegvsvp.apps.googleusercontent.com";

function ContactProfesseur() {
  const { id } = useParams(); // on récupère l'ID du prof dans l'URL

  const [formData, setFormData] = useState({
    classe: '',
    chapitres: '',
    disponibilites: '',
    mode: 'visio',
    date: ''
  });

  const heures = [
    '08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'
  ];

  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.client.init({
        clientId,
        scope: "https://www.googleapis.com/auth/calendar.events"
      });
    });
  }, []);

  const toggleHeure = (heure) => {
    setFormData((prev) => {
      const isSelected = prev.disponibilites.includes(heure);
      return {
        ...prev,
        disponibilites: isSelected
          ? prev.disponibilites.filter(h => h !== heure)
          : [...prev.disponibilites, heure]
      };
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = gapi.auth2.getAuthInstance();
    const user = await auth.signIn();
    const accessToken = user.getAuthResponse().access_token;
    gapi.client.setToken({ access_token: accessToken });

    await gapi.client.load('calendar', 'v3');

    const [startHour, endHour] = formData.disponibilites.split(' - ');
    const startDateTime = moment(`${formData.date}T${startHour}`).toISOString();
    const endDateTime = moment(`${formData.date}T${endHour}`).toISOString();

    const event = {
        // Le nom du prof sera a modifier dynamiquement 
      summary: `Cours de ${formData.chapitres} avec Lucas`,
      description: `Cours pour la classe ${formData.classe}`,
      start: {
        dateTime: startDateTime,
        timeZone: "Europe/Paris",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Europe/Paris",
      },
    };

    try {
      await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      alert('Le rendez-vous a été ajouté dans ton Google Calendar !');
    } catch (error) {
      console.error("Erreur lors de l'insertion dans Calendar :", error);
      alert(' Une erreur est survenue lors de la création du rendez-vous.');
    }
  };

  return (
    <div className="contact-prof">
      <header className="header">
        <img src="../img/Courswap.png" alt="Courswap" className="logo" />
      </header>

      <section className="prof-info">
        {/* La photo sera recuperer via la base donnée */}
        <img src="/prof-avatar.png" alt="Prof" className="avatar" />
        <div>
            {/* A modifier dynamiquement  */}
          <h2>Lucas</h2>
          <p>Professeur de Mathématiques</p>
          <p>
            Passionné par l’enseignement, Lucas aide les élèves à reprendre confiance et à maîtriser leurs bases.
          </p>
        </div>
      </section>

      <form className="formulaire" onSubmit={handleSubmit}>
        <label>Date :</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <label>Classe :</label>
        <input type="text" name="classe" value={formData.classe} onChange={handleChange} placeholder="Ex: Terminale S" required />

        <label>Chapitres :</label>
        <input type="text" name="chapitres" value={formData.chapitres} onChange={handleChange} placeholder="Ex: Probabilités, Suites" required />

        <label>Disponibilité (choisir une heure) :</label>
        <select name="disponibilites" value={formData.disponibilites} onChange={handleChange} required>
          <option value="">-- Choisir une heure --</option>
          {heures.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <label>Mode :</label>
        <select name="mode" value={formData.mode} onChange={handleChange}>
          <option value="visio">Visioconférence</option>
          <option value="presentiel">Présentiel</option>
        </select>

        {formData.mode === 'presentiel' && (
          <div className="map-container">
            <p>Carte Google Maps à afficher ici (lieu du cours)</p>
            <div className="map-placeholder"></div>
          </div>
        )}

        <button type="submit">Envoyer la demande</button>
      </form>
    </div>
  );
}

export default ContactProfesseur;
