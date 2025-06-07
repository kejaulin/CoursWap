

import { useParams } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { useAuth } from '../component/AuthProvider';
import GMAP from '../component/gMap';

function ContactProfesseur() {

  const calendarActions = {
    google: {
      label: 'Ajouter à mon agenda Google',
      endpoint: 'google'
    },
    local: {
      label: 'Générer mon évènement calendrier',
      endpoint: 'ical'
    },
  };
  const { id } = useParams(); 
  const [prof, setProf] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classe: '',
    chapitres: '',
    disponibilites: '',
    mode: 'visio',
    date: '',
    location:'',
    profId:id
  });

//  Definition des video de demo 
  const videosDemo = [
  {
    titre: "Résolution d’équation",
    description: "Description du contenu de la vidéo.",
    img: "",
    time: "15 min"
  },
  {
    titre: "Probabilité",
    description: "Description du contenu de la vidéo.",
    img: "",
    time: "20 min"
  },
  {
    titre: "Suites",
    description: "Description du contenu de la vidéo.",
    img: "",
    time: "28 min"
  }
];
 
 
  const { user, logout } = useAuth();
  const provider = user?.authMethod || 'local';
  // Charger les infos du prof dès que "id" change
  useEffect(() => {
    fetch(`http://localhost:4000/professeurs/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("404");
        return res.json();
      })
      .then(data => setProf(data))
      .catch(err => console.error('Erreur de récupération du professeur :', err));
  }, [id]);

  // Gestion des champs du formulaire
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLocationSelected = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location.address
    }));
  };

  // Quand on clique sur « Envoyer la demande », on crée l’événement dans le calendar
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
            setShowForm(false); // ferme le formulaire
      const url = new URL(`api/calendar/${calendarActions[provider].endpoint || calendarActions.local.endpoint}`, window.location.origin);
      fetch(url.href,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      }).then(async (res) => {
        if (res.ok){
          if(calendarActions[provider].endpoint === 'ical'){
            const blob = await res.blob();
            const url2 = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url2;
            a.download = 'meetingInfos.ics';
            a.click();
            URL.revokeObjectURL(url2);  
          }
          alert('Le rendez-vous a été ajouté à ton calendrier !');
        }
      });
    } catch (error) {
      console.error("Erreur lors de l’insertion dans Calendar :", error);
      alert('Une erreur est survenue lors de la création du rendez-vous.');
    }
  };

  // Tant que le prof n’est pas chargé, on affiche « Chargement… »
 if (!prof) {
    return <p className="text-center text-lg mt-8">Chargement du professeur…</p>;
  }

  // Une fois prof chargé, on peut afficher la fiche + le formulaire
   return (
    <div className="min-h-screen bg-purple-50 py-6 px-2 font-sans">
      <header className="flex justify-center mb-10">
        <img src="../img/appLogo.png" alt="Courswap" className="h-36 object-contain" />
      </header>

      <section className="bg-white rounded-3xl p-8 mb-6 flex flex-col md:flex-row gap-6 items-center shadow-lg relative">
      
      <div className="flex flex-col items-center mr-8 min-w-[220px]">   
    <button
      className="self-start text-2l text-gray-500 hover:text-purple-700 font-bold  "
      onClick={() => window.location.href = 'http://localhost:3000'}>
      <span className="mr-1">&#8592;</span>
      <span className="text-xl font-semibold">Retour aux professeurs</span>
    </button>
</div>
        <img src={prof.photo} alt={`Photo de ${prof.nom}`}
             className="w-32 h-32 rounded-2xl object-cover shadow-md" />
        <div className="flex flex-col gap-1 flex-1 ml-0 md:ml-6">
          <h2 className="text-3xl font-bold">{prof.nom}</h2>
          <p className="text-lg text-gray-600 font-semibold">Professeur de {prof.matiere}</p>
          <p className="text-gray-500 text-base">
            Passionné par l’enseignement, {prof.nom} aide les élèves à reprendre confiance et à maîtriser leurs bases.
          </p>
        </div>
          {!showForm && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="ml-0 md:ml-8 bg-purple-400 hover:bg-purple-500 text-white font-bold py-3 px-7 rounded-2xl text-lg shadow transition"
          >Prendre contact</button>
        )}
      </section>
        {showForm && (
        <form
          className="bg-white rounded-3xl p-8 mb-8 shadow-lg flex flex-col gap-4 relative max-w-xl mx-auto"
          onSubmit={handleSubmit}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-3xl text-purple-400 hover:text-purple-600 font-bold"
            onClick={() => setShowForm(false)}
            aria-label="Fermer"
          >&times;</button>
          
       <label className="font-semibold">Date :</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border rounded-lg p-2"
          />

         <label className="font-semibold">Classe :</label>
          <input
            type="text"
            name="classe"
            value={formData.classe}
            onChange={handleChange}
            placeholder="Ex: Terminale S"
            required
            className="border rounded-lg p-2"
          />

        <label className="font-semibold">Chapitres :</label>
          <input
            type="text"
            name="chapitres"
            value={formData.chapitres}
            onChange={handleChange}
            placeholder="Ex: Probabilités, Suites"
            required
            className="border rounded-lg p-2"
          />

        {/* Disponibilité (options issues de prof.disponibilites) */}
      <label className="font-semibold">Disponibilité (choisir un créneau) :</label>
          <select
            name="disponibilites"
            value={formData.disponibilites}
            onChange={handleChange}
            required
            className="border rounded-lg p-2"
          >
          <option value="">-- Choisir un créneau --</option>
          {prof.disponibilites.map((creneau) => (
            <option key={creneau} value={creneau}>
              {creneau}
            </option>
          ))}
        </select>

        {/* Mode : visio / présentiel */}
        <label className="font-semibold">Mode :</label>
        <select
          name="mode"
          value={formData.mode}
          onChange={handleChange}
          className="border rounded-lg p-2"
        >
          <option value="visio">Visioconférence</option>
          {prof.meetingLocations.length > 0 && <option value="presentiel">Présentiel</option> }
        </select>

        {formData.mode === "presentiel" && (
          <GMAP infoType='prof' poiMarkersList={prof.meetingLocations} onLocationSelect={handleLocationSelected}/>
        )}

        <button type="submit" className="mt-4 bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-2xl text-lg shadow transition">{calendarActions[provider].label || calendarActions.local.label}</button>
      </form>
       )}
 {/* Liste vidéos Statiques */}
 
      <section className="max-w-2xl mx-auto mt-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-700">Vidéos de {prof.nom} :</h3>
        {videosDemo.map((vid, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-white rounded-2xl shadow-md p-4 mb-4">
            <img src={vid.img || "https://via.placeholder.com/56"} alt="" className="w-14 h-14 rounded-xl bg-gray-100 object-cover" />
            <div className="flex-1">
              <div className="font-bold">{vid.titre}</div>
              <div className="text-sm text-gray-600">{vid.description}</div>
              <div className="text-xs text-gray-400 mt-1">Today • {vid.time}</div>
            </div>
            <button className="text-3xl text-purple-400 hover:text-purple-600 transition">&#9654;</button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default ContactProfesseur;
