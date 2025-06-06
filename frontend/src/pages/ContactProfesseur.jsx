import { useParams } from 'react-router-dom';
import '../style/style.css';
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

  const [formData, setFormData] = useState({
    classe: '',
    chapitres: '',
    disponibilites: '',
    mode: 'visio',
    date: '',
    location:'',
    profId:id
  });

  // Etat pour stocker les données du prof récupérées dans le backend
  const [prof, setProf] = useState(null);

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
    if(formData.mode === "presentiel" && formData.location == '') return alert('Veuillez choisir une adresse');

    try {
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
    return <p>Chargement du professeur…</p>;
  }

  // Une fois prof chargé, on peut afficher la fiche + le formulaire
  return (
    <div className="contact-prof">
      <section className="prof-info">
        <img
          src={prof.photo} alt={`Photo de ${prof.nom}`} className="avatar"/>
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

        <label>Disponibilité (choisir un créneau) :</label>
        <select
          name="disponibilites"
          value={formData.disponibilites}
          onChange={handleChange}
          required
        >
          <option value="">-- Choisir un créneau --</option>
          {prof.disponibilites.map((creneau) => (
            <option key={creneau} value={creneau}>
              {creneau}
            </option>
          ))}
        </select>

        <label>Mode :</label>
        <select
          name="mode"
          value={formData.mode}
          onChange={handleChange}
        >
          <option value="visio">Visioconférence</option>
          {prof.meetingLocations.length > 0 && <option value="presentiel">Présentiel</option> }
        </select>

        {formData.mode === "presentiel" && (
            <GMAP infoType='prof' poiMarkersList={prof.meetingLocations} onLocationSelect={handleLocationSelected}/>
        )}

        <button type="submit">{calendarActions[provider].label || calendarActions.local.label}</button>
      </form>
    </div>
  );
}

export default ContactProfesseur;
