import { useEffect, useState, useRef } from 'react';
import { useAuth } from './component/AuthProvider';
import { useNavigate } from 'react-router-dom';
import LiveButton from './component/LiveButton';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

function MainPage(){
    const Server_URL = import.meta.env.VITE_SERVER_URL;

    const { user, logout } = useAuth();

    const [selectedSubject, setSelectedSubject] = useState(null);
    const [allCourses, setCourses] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [allProfesseurs, setAllProfesseurs] = useState([]);
    const [tokens, setTokens] = useState(0);
    const navigate = useNavigate();
    const scrollRef = useRef(null);

    useEffect(() => {
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => setCourses(data.allCourses));

        fetch('/api/users')
            .then(res => res.json())
            .then(data => setAllProfesseurs(data));

        fetch('/api/meetings')
            .then(res => res.json())
            .then(data => setMeetings(data));
    }, []);

    useEffect(() => {
        if (user) {
            fetch(`/api/users/${user._id}/tokens`)
                .then(res => res.json())
                .then(tokens => {
                    setTokens(tokens);
                });
        }
    }, [user]);

    const handleMeetingJoin = async (meet) => {
        if(meet.createdBy._id !== user._id && !meet.participants.includes(user._id)) {
            if (tokens < meet.rejoinCost) {e.preventDefault(); return}
            else if (tokens >= meet.rejoinCost){
                const res = await fetch(`/api/users/${user._id}/tokens/subtract`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ amount: meet.rejoinCost })
                });
                if(res.error) return res.error;
                await fetch(`/api/meetings/${meet._id}/join`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ participantInfos: user._id })
                });
                navigate(0);
            }
        }
    }

    if (!user) {
        return (
            <div className="font-sans flex flex-col items-center">
                <section className="w-full h-50 mt-5 mb-1 flex items-center justify-center">
                    <img src="/img/appLogo.png" alt="Courswap Logo" className="w-auto h-full" />
                </section>
                <section className="bg-purple-200 rounded-3xl p-6 m-4 flex flex-col md:flex-row items-center justify-between w-2/3">
                    <div className="md:w-2/3 space-y-4">
                        <h2 className="text-2xl md:text-xl font-bold uppercase">Apprendre ensemble, gratuitement et sans limites !</h2>
                        <img src="/img/studentWorking.png" alt="Students Studying" className="md:w-9/10 md:h-full rounded-xl mt-6 md:mt-0" />
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
        ? meetings.filter(meet => meet.matiere === selectedSubject)
        : [];

    const profsFiltres = selectedSubject
        ? allProfesseurs.filter(prof => prof.matiere === selectedSubject)
        : [];

    const scroll = (direction) => {
          if (scrollRef.current) {
              const scrollAmount = scrollRef.current.offsetWidth * 0.8;
              scrollRef.current.scrollBy({
                  left: direction === 'left' ? -scrollAmount : scrollAmount,
                  behavior: 'smooth',
              });
          }
      }

    return (
        <>
            {user.role === 'professeur' && <LiveButton />}
            <div className="font-sans flex flex-col items-center">
                <section className="bg-purple-200 rounded-3xl p-6 m-4 mb-0.5 flex flex-col md:flex-row items-center justify-left w-9/10 space-x-2">
                    {allCourses.map((course, index) => {
                        return (<button key={course} onClick={() => setSelectedSubject(course)} className="border px-4 py-1 rounded hover:bg-gray-400 focus:bg-gray-400 focus:text-white hover:text-white hover:cursor-pointer font-bold courseButton">{course}</button>)
                    })}
                </section>
                {selectedSubject && (
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
                                                src={(Server_URL)?`${Server_URL}${prof.photo}`:`http://localhost:4000${prof.photo}`}
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
                            <div className="relative w-full">
                                <button
                                    onClick={() => scroll('left')}
                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-100 bg-white shadow-md p-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                                </button>

                                <div
                                    ref={scrollRef}
                                    className="flex overflow-x-auto gap-4 py-4 px-2 scroll-smooth"
                                    style ={{scrollbarWidth: "none", msOverflowStyle: "none"}}>

                                    <ul className="flex display-inline space-x-4">
                                        {filteredMeetings.length === 0 && (
                                            <li>Aucun live en cours pour ce thème.</li>
                                        )}
                                        {filteredMeetings.map((meet, index) => (
                                            <li key={meet._id} className="mb-2">
                                                <div
                                                    key={index}
                                                    className="relative w-80 h-60 rounded-xl overflow-hidden shadow-md bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${meet.imageUrl || '/img/studentWorking.png'})` }}
                                                >
                                                    {tokens < meet.rejoinCost && meet.createdBy._id !== user._id && !meet.participants.includes(user._id) && (
                                                        <>
                                                            <div className="absolute inset-0 bg-gray-200/70 z-10 pointer-events-none" />
                                                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                                                <div className="bg-white bg-opacity-90 text-red-600 font-bold text-lg px-4 py-2 rounded-xl shadow-md">
                                                                    Tokens insuffisants
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/80 to-transparent z-20 pointer-events-none" />

                                                    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 text-black">
                                                        <div className="z-30">
                                                            <h3 className="text-lg font-bold truncate">{meet.summary}</h3>
                                                            <p className="text-sm font-medium">
                                                                {new Date(meet.startDateTime).toLocaleString()} – {new Date(meet.endDateTime).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        <div className="flex justify-between items-end mt-auto">
                                                            <a
                                                                href={tokens < meet.rejoinCost && meet.createdBy._id !== user._id && !meet.participants.includes(user._id) ? "" : meet.hangoutLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={async (e) => { await handleMeetingJoin(meet) }}
                                                                className={`text-sm font-semibold px-3 py-1 rounded-full transition ${tokens < meet.rejoinCost && meet.createdBy._id !== user._id && !meet.participants.includes(user._id)
                                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                    }`}>
                                                                {meet.createdBy._id === user._id ? "Rejoindre mon live" : "Rejoindre le live"}
                                                            </a>
                                                            {(meet.createdBy._id !== user._id && !meet.participants.includes(user._id)) && (
                                                                <div className="flex items-center bg-orange-100 text-orange-700 font-semibold rounded-xl px-2 py-1 w-fit">
                                                                    <span className='pr-1'>Coût :</span>
                                                                    <img src="/img/token.png" alt="SwapTokens logo" className="w-5 h-5" />
                                                                    <span className='pl-1'>{meet.rejoinCost}</span>
                                                                </div>    
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => scroll('right')}
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-100 bg-white shadow-md p-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </>
    )
};

export default MainPage;