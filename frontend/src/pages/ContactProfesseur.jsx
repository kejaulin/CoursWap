import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../component/AuthProvider';
import GMAP from '../component/gMap';

function ContactProfesseur() {
  const Base_URL = import.meta.env.VITE_BASE_URL;
  const Backend_Port = import.meta.env.VITE_BACKEND_PORT;

  const [myVideos, setMyVideos] = useState([]);
  const [openVideo, setOpenVideo] = useState(null);
  const navigate = useNavigate();

  
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
		location: '',
		profId: id
	});

	const { user, logout } = useAuth();
	const provider = user?.authMethod || 'local';
	const [tokens, setTokens] = useState(0);

	// Charger les infos du prof dès que "id" change
	useEffect(() => {
		fetch(`/api/users/${id}`)
			.then(res => {
				if (!res.ok) throw new Error("404");
				return res.json();
			})
			.then(data => setProf(data))
			.catch(err => console.error('Erreur de récupération du professeur :', err));
	}, [id]);

  useEffect(() => {
      fetch(`/api/videos/user/${id}`)
        .then(res => res.json())
        .then(setMyVideos)
        .catch(() => setMyVideos([]));
  }, [id]);

	useEffect(() => {
		if (user) {
			fetch(`/api/users/${user._id}/tokens`)
				.then(res => res.json())
				.then(tokens => {
					setTokens(tokens);
				});
		}
	}, [user]);

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
		if (formData.mode === "presentiel" && formData.location == '') return alert('Veuillez choisir une adresse');

		try {

			// Extraction date et heure
			const [date, creneau] = formData.disponibilites.split(' '); // ex: "10/06/2025 08:00-10:00"

			// Convertir date au format ISO 
			function convertDateToISO(dateStr) {
				const [day, month, year] = dateStr.split('/');
				return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
			}
			const dateISO = convertDateToISO(date);

			// Construire l’objet oneToOneEvent à envoyer
			const oneToOneEventData = {
				etudiantId: user._id,
				profId: formData.profId,
				date: dateISO,
				heure: creneau,
				mode: formData.mode,
				location: formData.location || null
			};

			// Envoi de l’événement au calendrier
			const url = new URL(`api/calendar/${calendarActions[provider].endpoint || calendarActions.local.endpoint}`, window.location.origin);
			fetch(url.href, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(formData),
			}).then(async (res) => {
				if (res.ok) {
					if (calendarActions[provider].endpoint === 'ical') {
						const blob = await res.blob();
						const url2 = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url2;
						a.download = 'oneToOneEventInfos.ics';
						a.click();
						URL.revokeObjectURL(url2);
					}
					const tokenRes = await fetch(`/api/users/${user._id}/tokens/subtract`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({ amount: 3 })
					});
					if (tokenRes.error) return tokenRes.error;
					navigate(0);
					alert('Le rendez-vous a été ajouté à ton calendrier !');
				}
			});

			//Création du oneToOneEvent en base
			const oneToOneEventRes = await fetch('/api/onetooneevents/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(oneToOneEventData),
			});

			if (!oneToOneEventRes.ok) throw new Error('Erreur lors de la création du oneToOneEvent');


			// Suppression du créneau réservé dans les dispos du prof
			const dispoRes = await fetch(`/api/users/${formData.profId}/disponibilites`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ date, creneau }),
			});

			if (!dispoRes.ok) throw new Error('Erreur lors de la mise à jour des disponibilités');

			const dispoData = await dispoRes.json();

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
            type="button"
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors cursor-pointer mb-6"
            onClick={() => navigate('/')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux professeurs
          </button>
        </div>
        <img
          src={(Base_URL)?`${Base_URL}:${Backend_Port}${prof.photo}`:`http://localhost:4000${prof.photo}`}
          alt={`Photo de ${prof.nom}`}
          className="w-32 h-32 rounded-2xl object-cover shadow-md" />
				<div className="flex flex-col gap-1 flex-1 ml-0 md:ml-6">
					<h2 className="text-3xl font-bold">{prof.nom}</h2>
					<p className="text-lg text-gray-600 font-semibold">Professeur de {prof.matiere}</p>
					<p className="text-gray-500 text-base">
						Passionné par l’enseignement, {prof.nom} aide les élèves à reprendre confiance et à maîtriser leurs bases.
					</p>
				</div>
				{user._id === id ? (
					<button
						onClick={() => navigate('/profil')}
						className="ml-0 md:ml-8 bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-7 rounded-2xl text-lg shadow transition"
					> Voir mon profil
					</button>
				) : (
					!showForm && (
						<button
							onClick={() => setShowForm(v => !v)}
							className="ml-0 md:ml-8 bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-7 rounded-2xl text-lg shadow transition">
							Prendre contact
						</button>
					)
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
						{prof.meetingLocations && prof.meetingLocations.length > 0 && <option value="presentiel">Présentiel</option>}
					</select>

					{formData.mode === "presentiel" && (
						<GMAP infoType='prof' poiMarkersList={prof.meetingLocations} onLocationSelect={handleLocationSelected} />
					)}

					<button type={`${tokens < 3 ? "button" : "submit"}`} className={`mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-2xl text-lg shadow transition flex items-center justify-around 
						${tokens < 3 ? 'opacity-50 disabled cursor-not-allowed' : 'cursor-pointer'}`}>
						<span>{calendarActions[provider].label || calendarActions.local.label}</span>
						<div className="flex items-center gap-2 bg-orange-100 text-orange-700 font-semibold rounded-xl px-4 py-2 w-17 sm:w-31">
							<img src="./../img/token.png" alt="SwapTokens logo" className="w-5 h-5" />
							<span className="hidden sm:inline whitespace-nowrap">Coût: </span>
							<span>3</span>
						</div>
					</button>
				</form>
			)}
			{/* Liste vidéos Statiques */}
      <section className="max-w-2xl mx-auto mt-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-700">Vidéos de {prof.nom} :</h3>
        {myVideos.map((vid, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-white rounded-2xl shadow-md p-4 mb-4 cursor-pointer hover:bg-purple-50 transition"
            onClick={() => setOpenVideo(vid)}
          >
            {/* Miniature ou icône */}
            <div className="w-32 h-20 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <span className="text-4xl text-purple-400">&#9654;</span>
            </div>
            <div className="flex-1">
              <div className="font-bold">{vid.title}</div>
              <div className="text-sm text-gray-600">{vid.category}</div>
            </div>
          </div>
        ))}

        {/* Modal vidéo */}
        {openVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-2xl p-6 shadow-lg relative max-w-2xl w-full flex flex-col items-center">
              <button
                className="absolute top-2 right-4 text-3xl text-purple-400 hover:text-purple-600 font-bold"
                onClick={() => setOpenVideo(null)}
                aria-label="Fermer"
              >&times;</button>
              <h4 className="font-bold text-lg mb-2">{openVideo.title}</h4>
              <video
                src={`/api/videos/${openVideo._id}/stream`}
                controls
                autoPlay
                className="rounded-xl w-full max-h-[60vh] bg-black"
              />
              <div className="text-sm text-gray-600 mt-2">{openVideo.category}</div>
            </div>
          </div>
        )}
      </section>
			
		</div>
	);
}

export default ContactProfesseur;
