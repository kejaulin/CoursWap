import { useState, useEffect } from "react";
import moment from "moment";
import { useAuth } from "../component/AuthProvider";
import { toast, ToastContainer } from 'react-toastify';
import EspaceProf from '../component/EspaceProf';
import EspaceEtu from '../component/EspaceEtu';
import {useNavigate} from 'react-router-dom';
import AddressForm from '../component/AddressForm';

function ProfilPage() {
  const [nom, setNom] = useState("");
  const [matiere, setMatiere] = useState("");
  const [photo, setPhoto] = useState(null);
  const genererDisponibilites = () => {
    return Array.from({ length: 6 }, (_, i) => ({
      date: moment().add(i, 'days').format("DD/MM/YYYY"),
      creneaux: []
    }));
  };
  const [dispos, setDispos] = useState(genererDisponibilites());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const { user } = useAuth();
  const [profilCree, setProfilCree] = useState(false);
  const [profil, setProfil] = useState(null);
  const [showProfForm, setShowProfForm] = useState(false);
  const [role, setRole] = useState(user.role); // 'etudiant' ou 'professeur'
  const [onetooneevents, setOneToOneEvents] = useState([]);
  const navigate = useNavigate(); 
  //charger les matières disponibles depuis l'API
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setAllCourses(data.allCourses));
  }, []);

  // Charger le profil utilisateur si déjà connecté
  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setProfil(data);
        setLoading(false);
        // Si profil déjà créé (nom ET role présents), => pas de form
        if (data && data.role && data.nom) {
          setRole(data.role);
          setNom(data.nom);
          setMatiere(data.matiere || "");
          setProfilCree(true);
          // Si le profil est professeur, on charge les disponibilités
          if (data.role === "professeur") {
          const joursAvenir = genererDisponibilites();

          const fusion = joursAvenir.map(jour => {
          const existant = data.disponibilites?.find(d => d.date === jour.date);
          
          return existant ? { ...jour, creneaux: existant.creneaux } : jour;
          });
          setDispos(fusion);}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Charger les réunions de l'utilisateur connecté
  useEffect(() => {
    fetch('/api/onetooneevents/my-meetings', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setOneToOneEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);
  // Créneaux fixes à cocher
  const allCreneaux = ["08:00-10:00", "10:00-12:00", "14:00-16:00", "16:00-18:00"];

  // Pour cocher/décocher un créneau
  const toggleCreneau = (dayIdx, creneau) => {
    setDispos(prev => {
      const copy = [...prev];
      const creneauxDuJour = new Set(copy[dayIdx].creneaux);
      if (creneauxDuJour.has(creneau)) {
        creneauxDuJour.delete(creneau);
      } else {
        creneauxDuJour.add(creneau);
      }
      copy[dayIdx] = {
        ...copy[dayIdx],
        creneaux: Array.from(creneauxDuJour)
      };
      return copy;
    });
  };

  // Quand on choisit une photo
  const handlePhoto = e => {
    setPhoto(e.target.files[0]);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append('nom', nom);
      form.append('role', role);

      if (role === "professeur") {
        form.append('matiere', matiere);
        form.append('photo', photo);
        form.append('disponibilites', JSON.stringify(dispos));
      }
      const res = await fetch('/api/users/register', {
        method: 'POST',
        body: form,
      });
      if (res.ok) {
        toast.success("Profil créé !");
        setProfilCree(true); // On cache le form
        setShowProfForm(false);

        // On recharge le profil après création/mise à jour
        fetch("/api/users/me", { credentials: "include" })
          .then(res => res.json())
          .then(data => setProfil(data));
      } else {
        const err = await res.json();
        setError(err.message || "Erreur serveur");
      }
    } catch (err) {
      setError("Erreur réseau ou serveur");
    }
    setLoading(false);
  };
  if (loading) return <div>Chargement…</div>;

  const ProfForm = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block font-semibold mb-1">Nom</label>
        <input value={nom} onChange={e => setNom(e.target.value)} className="border rounded-lg p-2 w-full" required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Matière enseignée</label>
        <select
          value={matiere}
          onChange={e => setMatiere(e.target.value)}
          className="border rounded-lg p-2 w-full"
          required
        >
          <option value="">Choisir une matière</option>
          {allCourses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Photo</label>
        <input type="file" accept="image/*" onChange={handlePhoto} className="block" />
      </div>
      <div>
        <label className="block font-semibold mb-2">Disponibilités sur 1 semaine</label>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-purple-50">
            <thead>
              <tr>
                <th className="text-xs p-2">Date</th>
                {allCreneaux.map((c, i) => (
                  <th key={i} className="text-xs p-2">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dispos.map((d, i) => (
                <tr key={d.date}>
                  <td className="text-xs font-medium p-2">{moment(d.date, "DD/MM/YYYY").format("ddd DD/MM")}</td>
                  {allCreneaux.map(c => (
                    <td key={c} className="text-center p-2">
                      <input type="checkbox" checked={d.creneaux.includes(c)} onChange={() => toggleCreneau(i, c)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-2">Lieu de rendez-vous en présentiel:</label>
        <div className="overflow-x-auto">
          <AddressForm userId={user._id} />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-500 text-white py-2 px-8 rounded-xl font-semibold hover:bg-purple-600"
      >
        {loading ? "Création..." : "Enregistrer"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );

  // Formulaire étudiant initial
  const EtudiantForm = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Créer mon profil</h2>
      <div>
        <label className="block font-semibold mb-2">Je suis :</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="etudiant" checked={role === "etudiant"} onChange={e => setRole(e.target.value)} />            Étudiant
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="professeur" checked={role === "professeur"} onChange={e => setRole(e.target.value)} />            Professeur
          </label>
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Email</label>
        <div className="border rounded-lg p-2 w-full bg-gray-100">{user.email}</div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Nom</label>
        <input value={nom} onChange={e => setNom(e.target.value)} className="border rounded-lg p-2 w-full" required />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-500 text-white py-2 px-8 rounded-xl font-semibold hover:bg-purple-600"
      >
        {loading ? "Création..." : "Créer le profil"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 mt-8">
      <div className="flex flex-col items-center mr-8 min-w-[220px]">
        <button
          type="button"
          className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors cursor-pointer mb-6"
          onClick={() => navigate("/")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux professeurs
        </button>
      </div>
      <ToastContainer />

      {!profilCree || showProfForm ? (
        // Formulaire conditionnel : Étudiant, Professeur ou évolution "Devenir professeur"
        role === "professeur" || showProfForm ? ProfForm : EtudiantForm
      ) : (
        <>
          {role === "professeur" ? (
            <EspaceProf
              nom={nom || (profil && profil.nom)}
              disponibilites={dispos}
              onEdit={() => setShowProfForm(true)}
              onRetourAccueil={() => navigate("/")}
              oneToOneEvents={onetooneevents}
              user={user}
            />
          ) : (
            <EspaceEtu
              onDevenirProf={() => {
                setRole("professeur");
                setShowProfForm(true);
              }}
              nom={nom || (profil && profil.nom)}
              oneToOneEvents={onetooneevents}
              user={user}
            />
          )}
        </>
      )}
    </div>
  );

}

export default ProfilPage; 