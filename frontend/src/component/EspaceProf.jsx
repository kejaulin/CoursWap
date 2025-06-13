import React from 'react';
import moment from 'moment';

function EspaceProf({ nom, disponibilites, onEdit, onRetourAccueil, oneToOneEvents, user }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-bold text-purple-700 mb-4">Bienvenue, {nom} !</h3>
      <p className="mb-2">Tu es maintenant professeur.<br />Voici un résumé de tes disponibilités :</p>
      <div className="mb-2">
        {disponibilites.slice(0, 7).map(d =>
          <div key={d.date} className="text-sm">
            {d.date} : {d.creneaux.length ? d.creneaux.join(", ") : "Aucun créneau"}
          </div>
        )}
      </div>
      <button
        className="bg-purple-500 text-white py-2 px-8 rounded-xl font-semibold hover:bg-purple-600"
        onClick={onEdit}
      >
        Modifier mes disponibilités
      </button>
      <button
        className="mt-2 text-gray-600 underline"
        onClick={onRetourAccueil}
      >
        Retour à l'accueil
      </button>
      <div className="max-w-3xl mx-auto p-4">
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
            </div> </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EspaceProf;
