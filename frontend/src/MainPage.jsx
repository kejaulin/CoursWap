import {useEffect, useState } from 'react';
import { useAuth } from './component/AuthProvider';
import { useNavigate } from 'react-router-dom';

function MainPage(){

    const { user, logout } = useAuth();

    const [selectedSubject, setSelectedSubject] = useState(null);
    const [allCourses, setCourses] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [allProfesseurs, setAllProfesseurs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/courses')
          .then(res => res.json())
          .then(data => setCourses(data.allCourses));

        fetch('/api/users')
            .then(res => res.json())
            .then(data => setAllProfesseurs(data))
      }, []);

    useEffect(() => {
        fetch('/api/meetings')
            .then(res => res.json())
            .then(data => setMeetings(data));
    }, []);

    if (!user){
        return(
        <div className="font-sans flex flex-col items-center">
            <section className="w-full h-50 mt-5 mb-1 flex items-center justify-center">
                <img src="./../img/appLogo.png" alt="Courswap Logo" className="w-auto h-full"/>
            </section>
            <section className="bg-purple-200 rounded-3xl p-6 m-4 flex flex-col md:flex-row items-center justify-between w-2/3">
                <div className="md:w-2/3 space-y-4">
                    <h2 className="text-2xl md:text-xl font-bold uppercase">Apprendre ensemble, gratuitement et sans limites !</h2>
                    <img src="../img/studentWorking.png" alt="Students Studying" className="md:w-9/10 md:h-full rounded-xl mt-6 md:mt-0"/>
                </div>
                <div className="md:w-1/3 space-y-4">
                    <p className="text-justify">Bienvenue sur Courswap, la plateforme collaborative qui révolutionne l'apprentissage ! Ici, le partage de connaissances est sans barrières ni frais : élèves, étudiants et passionnés se retrouvent pour échanger, apprendre et progresser ensemble. Rejoignez-nous pour découvrir un espace où l'entraide fait la force et où chaque cours est une opportunité de grandir.</p>
                    <a href="#" className="underline">En savoir plus &gt;</a>
                </div>
            </section>
            <section className="pt-8 pb-8 text-center">
                <h3 className="text-2xl font-semibold mb-4 uppercase">Comment CourSwap fonctionne ?</h3>
                <p className="text-justify max-w-6xl mx-5 pb-4">CourSwap est une plateforme de cours en ligne par visioconférence qui permet l’apprentissage par la valorisation de ses propres compétences. Elle met en relation des apprenants souhaitant améliorer leur compétence dans un domaine, avec de potentiels enseignants, permettant <span className="font-bold">un échange en temps réel</span> de leurs connaissances.</p>
                <p className="text-justify max-w-6xl mx-5 pb-4">Contrairement aux plateformes traditionnelles telles OpenClassroom ou encore le Cned qui ont un accès aux cours partiellement ou totalement payant, <span className="font-bold">CourSwap repose sur un modèle économique par échange collaboratif</span>. Ici on se concentre sur un modèle où l'apprentissage est valorisé par une monnaie interne basée sur <span className="font-bold">la contribution et l’engagement des utilisateurs.</span></p>
                <p className="text-justify max-w-6xl mx-5 pb-4">Dans les faits, un apprenant souhaitant s’améliorer, peut déposer une demande de cours avec les thèmes qu’il souhaite aborder. Celle-ci sera prise en charge par un enseignant qui organisera un cours, et les apprenants qui le souhaitent n’auront plus qu’à dépenser cette monnaie pour assister au cours. L’enseignant, lui, reçoit une rétribution pour le cours donné, qu’il peut réinvestir pour apprendre à son tour. Un apprenant ne souhaitant pas donner cours peut tout de même récupérer de la monnaie lentement au fur et à mesure du temps, ainsi chaque utilisateur peut donc être au choix <span className="font-bold">apprenant, enseignant, ou les deux !</span></p>
            </section>
        </div>
        )   
    }

    const filteredMeetings = selectedSubject
        ? meetings.filter(meet => meet.summary === selectedSubject)
        : [];
    
    const profsFiltres = selectedSubject
        ? allProfesseurs.filter(prof => prof.matiere === selectedSubject)
        : [];

    return(
    <div className="font-sans flex flex-col items-center">
        <section className="bg-purple-200 rounded-3xl p-6 m-4 mb-0.5 flex flex-col md:flex-row items-center justify-left w-9/10 space-x-2">
            {allCourses.map((course,index)=>{
                return (<button key={course} onClick={()=> setSelectedSubject(course)} className="border px-4 py-1 rounded hover:bg-gray-400 focus:bg-gray-400 focus:text-white hover:text-white hover:cursor-pointer font-bold courseButton">{course}</button>)
            })}
        </section>
        { selectedSubject && (
        <div className="flex flex-col items-center justify-between w-9/10">
            <section className="bg-purple-200 rounded-3xl p-6 m-4 mb-0.5 flex flex-col items-flex-start justify-left w-full">
                <h4 className="text-2xl font-semibold mb-4">Professeurs de {selectedSubject} &#8680;</h4>
                <div className="flex flex-wrap gap-6">
    {profsFiltres.length === 0 ? (
      <p>Aucun professeur trouvé pour cette matière.</p>
    ) : (
      profsFiltres.map((prof) => (
        <button
          key={prof._id}
          className="flex flex-col items-center p-4 bg-white rounded-2xl shadow hover:bg-purple-100 transition cursor-pointer border-2 border-transparent hover:border-purple-400"
          onClick={() => navigate(`/profs/${prof._id}`)}
        >
          <img
            src={prof.photo}
            alt={prof.nom}
            className="w-20 h-20 object-cover rounded-full mb-2 border-2 border-purple-300"
          />
          <span className="font-bold text-lg text-purple-700">{prof.nom}</span>
        </button>
      ))
    )}
  </div>
            </section>
            <section className="bg-purple-200 rounded-3xl p-6 m-4 mb-0.5 flex flex-col items-flex-start justify-left w-full">
                <h4 className="text-2xl font-semibold mb-4">Les dernières vidéos de {selectedSubject} &#8680;</h4>
            </section>
            <section className="bg-purple-200 rounded-3xl p-6 m-4 mb-0.5 flex flex-col items-flex-start justify-left w-full">
                <h4 className="text-2xl font-semibold mb-4">Les lives de {selectedSubject} en cours &#8680;</h4>
                <ul>
                            {filteredMeetings.length === 0 && (
                                <li>Aucun live en cours pour ce thème.</li>
                            )}
                            {filteredMeetings.map(meet => (
                                <li key={meet._id} className="mb-2">
                                    <img src="" alt="" />
                                    <span className="font-bold">{meet.summary}</span>
                                    {" — "}
                                    <a
                                        href={meet.hangoutLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        Rejoindre le live
                                    </a>
                                    {" ("}
                                    {new Date(meet.startDateTime).toLocaleString()} - {new Date(meet.endDateTime).toLocaleString()}
                                    {")"}
                                </li>
                            ))}
                        </ul>
            </section>
        </div>
        )}
    </div>
    ) 
};

export default MainPage;