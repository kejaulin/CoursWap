

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
    fetch(`http://localhost:4000/users/${id}`)
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
      ...prev, profId: id, 
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
     
      // Extraction date et heure
    const [date, creneau] = formData.disponibilites.split(' '); // ex: "10/06/2025 08:00-10:00"
    
    // Convertir date au format ISO 
    function convertDateToISO(dateStr) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
    }
    const dateISO = convertDateToISO(date);

    // Génération d’un meetingId (ici un simple UUID temporaire)
    const meetingId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

    // Construire l’objet meeting à envoyer
    const meetingData = {
      studentId: user._id,
      profId: formData.profId,
      meetingId,
      date: dateISO,
      heure: creneau, // ex: "08:00-10:00"
      mode: formData.mode,
      lieu: formData.lieu || null,
      chapitres: formData.chapitres,
      classe: formData.classe,
    };

      // Envoi de l’événement au calendrier
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
      
    //Création du meeting en base
    const meetingRes = await fetch('/api/meetings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(meetingData),
    });

    if (!meetingRes.ok) throw new Error('Erreur lors de la création du meeting');

     
  // Suppression du créneau réservé dans les dispos du prof
  const dispoRes = await fetch(`/api/users/${formData.profId}/disponibilites`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ date, creneau }),
  });

  if (!dispoRes.ok) throw new Error('Erreur lors de la mise à jour des disponibilités');

  const dispoData = await dispoRes.json();
  console.log(dispoData)

  // Mettre à jour localement les dispos
  setProf(prev => ({
    ...prev,
    disponibilites: dispoData.disponibilites,
  }));
  
 
  setShowForm(false);
 
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
          {/*
            À la place d’un tableau « heures = [...] », on utilise
            directement la liste du professeur : prof.disponibilites
          */}
          {prof.disponibilites?.flatMap(d =>
            d.creneaux.map(c => ({
              date: d.date,
              creneau: c
            }))
          ).map(({ date, creneau }) => (
            <option key={`${date}-${creneau}`} value={`${date} ${creneau}`}>
              {`${date} : ${creneau}`}
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