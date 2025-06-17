import { useState, useEffect } from "react";
import moment from 'moment';
import { useNavigate } from "react-router-dom";

function EspaceEtu({ nom, oneToOneEvents, user, onDevenirProf }) {
  const [nbCreneauxEtu, setNbCreneauxEtu] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/stats/onetooneevents')
      .then(res => res.json())
      .then(data => {
        const etuData = data.etudiants.find(e => e.id === user._id);
        setNbCreneauxEtu(etuData?.totalCreneaux || 0);
      })
      .catch(err => {
        console.error("Erreur stats étudiant :", err);
      });
  }, [user._id]);

  return (
    <div>
      <h3 className="text-xl font-bold text-purple-700 mb-4">Salut {nom} !</h3>
      <p>Ton profil étudiant est prêt. Bienvenue sur la plateforme !</p>
      <button
        className="bg-purple-500 text-white py-2 px-8 rounded-xl font-semibold hover:bg-purple-600"
        onClick={() => window.location.href = "/"}
      >
        Aller à l'accueil
      </button>
      <button
        className="mt-3 bg-green-500 text-white py-2 px-6 rounded-xl font-semibold hover:bg-green-600"
        onClick={onDevenirProf}

      >
        Devenir professeur
      </button>
        <div className="bg-purple-100 p-4 rounded-xl text-purple-900 shadow my-4 text-center w-full max-w-3xl mx-auto">
          <h4 className="text-lg font-semibold mb-2">📊 Statistiques d'activité :</h4>
            <p className="mb-2">
              Tu as {nbCreneauxEtu === 0
                ? "aucun rendez-vous prévu pour le moment"
                : <>ou vas assister à <strong>{nbCreneauxEtu}</strong> rendez-vous</>} en tant qu’étudiant.
            </p>
        </div>

      <div className="max-w-3xl mx-auto p-4" >
        <h2 className="text-2xl font-semibold mb-6 text-purple-700" >Mes rendez-vous</h2>
        {oneToOneEvents.length === 0 ? (
          <p>Aucun rendez-vous trouvé.</p>
        ) : (
          <ul className="space-y-4">
            {oneToOneEvents.map(oneToOneEvent => (
              <li className="border border-purple-300 rounded-xl p-4 shadow hover:shadow-lg transition-shadow"
                key={oneToOneEvent._id} style={{ marginBottom: '1rem' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    <strong>Date :</strong> {moment(oneToOneEvent.date).format("DD/MM/YYYY")}
                  </span>
                  <span className="text-sm text-gray-600">
                    <strong>Heure :</strong> {oneToOneEvent.heure}
                  </span>
                </div>
                <div className="mb-2 text-gray-700">
                  <strong>Mode :</strong> {oneToOneEvent.mode}
                </div>
                <div className="flex gap-6 text-gray-800 font-medium">
                  <div>
                    <strong>Professeur :</strong>{" "}
                    {String(oneToOneEvent.profId._id) === String(user._id) ? "Vous" : oneToOneEvent.profId.nom}
                  </div>
                  <div>
                    <strong>Étudiant :</strong>{" "}
                    {String(oneToOneEvent.etudiantId._id) === String(user._id) ? "Vous" : oneToOneEvent.etudiantId.nom}
                  </div>
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    onClick={async () => {
                      if (window.confirm("Confirmer l'annulation du rendez-vous ?")) {
                        try {
                          const res = await fetch(`/api/onetooneevents/${oneToOneEvent._id}`, {
                            method: 'DELETE',
                            credentials: 'include',
                          });

                          const data = await res.json();

                          if (res.ok) {
                            navigate(0);
                            alert(data.message || "Rendez-vous annulé");
                          } else {
                            console.error("Erreur serveur:", data.error);
                            alert("Erreur lors de la suppression");
                          }
                        } catch (err) {
                          console.error("Erreur réseau:", err);
                          alert("Erreur réseau");
                        }
                      }
                    }}
                  >
                    Annuler
                  </button>
                </div> </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EspaceEtu;
