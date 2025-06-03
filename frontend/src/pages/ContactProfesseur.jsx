// frontend/src/pages/ContactProfesseur.jsx
import { useParams } from 'react-router-dom';
import '../style/style.css';
import { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import moment from 'moment';

const clientId = '882025545288-d6jj90v0tlq2fm0rprshbvc1gfegvsvp.apps.googleusercontent.com';

function ContactProfesseur() {
  const { id } = useParams(); 

  const [formData, setFormData] = useState({
    classe: '',
    chapitres: '',
    disponibilites: '',
    mode: 'visio',
    date: ''
  });

  // Etat pour stocker les données du prof récupérées dans le backend
  const [prof, setProf] = useState(null);

  // Charger les infos du prof dès que "id" change
  useEffect(() => {
    fetch(`http://localhost:4000/api/professeurs/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("404");
        return res.json();
      })
      .then(data => setProf(data))
      .catch(err => console.error('Erreur de récupération du professeur :', err));
  }, [id]);

  // Initialiser l’API Google Calendar
  useEffect(() => {
    gapi.load("client:auth2", () => {
      gapi.client.init({
        clientId,
        scope: "https://www.googleapis.com/auth/calendar.events"
      });
    });
  }, []);

  // Gestion des champs du formulaire
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Quand on clique sur « Envoyer la demande », on crée l’événement dans Google Calendar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prof) return; // sécurité

    try {
      const auth = gapi.auth2.getAuthInstance();
      const user = await auth.signIn();
      const accessToken = user.getAuthResponse().access_token;
      gapi.client.setToken({ access_token: accessToken });
      await gapi.client.load('calendar', 'v3');

      // formData.disponibilites = "08:00 - 10:00" par ex.
      const [startHour, endHour] = formData.disponibilites.split(' - ');
      const startDateTime = moment(`${formData.date}T${startHour}`).toISOString();
      const endDateTime   = moment(`${formData.date}T${endHour}`).toISOString();

      const event = {
        summary: `Cours de ${formData.chapitres} avec ${prof.nom}`,
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

      await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      alert('Le rendez-vous a été ajouté dans ton Google Calendar !');
    } catch (error) {
      console.error("Erreur lors de l’insertion dans Calendar :", error);
      alert('Une erreur est survenue lors de la création du rendez-vous.');
    }
  };

  // Tant que le prof n’est pas chargé, on affiche « Chargement… »
  if (!prof) {
    return <p>Chargement du professeur…</p>;
  }

  // Une fois prof chargé, on peut afficher la fiche + le formulaire
  return (
    <div className="contact-prof">
      <header className="header">
        <img src="../img/Courswap.png" alt="Courswap" className="logo" />
      </header>

      <section className="prof-info">
        <img
          src={prof.photo}
          alt={`Photo de ${prof.nom}`}
          className="avatar"
        />
        <div>
          <h2>{prof.nom}</h2>
          <p>Professeur de {prof.matiere}</p>
          <p>
            Passionné par l’enseignement,{prof.nom} aide les élèves à reprendre
            confiance et à maîtriser leurs bases.
          </p>
        </div>
      </section>

      <form className="formulaire" onSubmit={handleSubmit}>
        <label>Date :</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label>Classe :</label>
        <input
          type="text"
          name="classe"
          value={formData.classe}
          onChange={handleChange}
          placeholder="Ex: Terminale S"
          required
        />

        <label>Chapitres :</label>
        <input
          type="text"
          name="chapitres"
          value={formData.chapitres}
          onChange={handleChange}
          placeholder="Ex: Probabilités, Suites"
          required
        />

        {/* Disponibilité (options issues de prof.disponibilites) */}
        <label>Disponibilité (choisir un créneau) :</label>
        <select
          name="disponibilites"
          value={formData.disponibilites}
          onChange={handleChange}
          required
        >
          <option value="">-- Choisir un créneau --</option>
          {/*
            À la place d’un tableau « heures = [...] », on utilise
            directement la liste du professeur : prof.disponibilites
          */}
          {prof.disponibilites.map((creneau) => (
            <option key={creneau} value={creneau}>
              {creneau}
            </option>
          ))}
        </select>

        {/* Mode : visio / présentiel */}
        <label>Mode :</label>
        <select
          name="mode"
          value={formData.mode}
          onChange={handleChange}
        >
          <option value="visio">Visioconférence</option>
          <option value="presentiel">Présentiel</option>
        </select>

        {/* Si présentiel est sélectionné, on affiche la carte */}
        {formData.mode === "presentiel" && (
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
