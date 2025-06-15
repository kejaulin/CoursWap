import { useState } from 'react';
import moment from 'moment';
import { useAuth } from '../component/AuthProvider';

function CreateMeetingPage({ onMeetingCreated }) {
    const { user, logout } = useAuth();

    const [summary, setSummary] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hideForm, setHideForm] = useState(false);
    const [livePrice, setTokenLivePrice] = useState(0);
    const [liveCreation, setDisableLiveCreation] = useState(false);

    // Met à jour endDateTime automatiquement quand startDateTime change
    const handleStartChange = (e) => {
        const start = e.target.value;
        setStartDateTime(start);
        if (start) {
            setDisableLiveCreation(false);
            const startDate = new Date(start);
            const endDate = new Date(startDate.getTime() + 30 * 60000); // +30min
            // Format pour input datetime-local
            const pad = n => n.toString().padStart(2, '0');
            const local = `${startDate.getFullYear()}-${pad(startDate.getMonth()+1)}-${pad(startDate.getDate())}T${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
            const localEnd = `${endDate.getFullYear()}-${pad(endDate.getMonth()+1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
            setEndDateTime(localEnd);
            if (user) {
                fetch(`/api/users/${user._id}/tokens`)
                .then(res => res.json())
                .then(availableTokens => {
                    const livePrice = Math.ceil((moment(localEnd).diff(moment(local))) / (30*60*1000));
                    if(availableTokens < livePrice) {setDisableLiveCreation(true);}
                    setTokenLivePrice(livePrice);
                });
            }
        } else {
            setEndDateTime('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const startISO = new Date(startDateTime).toISOString();
            const endISO = new Date(endDateTime).toISOString();

            const res = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ summary, startDateTime: startISO, endDateTime: endISO, rejoinCost: Math.floor(livePrice/2), originalCost:livePrice })
            });
            let data = {};
            try { data = await res.json(); } catch {}
            if (!res.ok) {
                setError(data.error || 'Erreur lors de la création du meeting');
            } else {
                const userTokens = await fetch(`/api/users/${user._id}/tokens/subtract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ amount: livePrice })
                }).then(res => res.json());
                setSuccess('Meeting créé avec succès !');
                setHideForm(true);
                setSummary('');
                setStartDateTime('');
                setEndDateTime('');
                if (onMeetingCreated) onMeetingCreated();
            }
        } catch (err) {
            setError(err.message);
            setHideForm(true);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto flex flex-col items-center">
            {!hideForm && (
            <>
                <h2 className="font-bold mb-3">Programmer un nouveau live</h2>
                <form onSubmit={handleSubmit} className="space-y-2">
                        <div>
                            <label className="block font-semibold">Sujet du live</label>
                            <input
                                type="text"
                                value={summary}
                                onChange={e => setSummary(e.target.value)}
                                required
                                className="w-full border rounded px-2 py-1"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold">Début</label>
                            <input
                                type="datetime-local"
                                value={startDateTime}
                                onChange={handleStartChange}
                                required
                                className="w-full border rounded px-2 py-1"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold">Fin (automatique +30min)</label>
                            <input
                                type="datetime-local"
                                value={endDateTime}
                                readOnly
                                disabled
                                className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-500"
                            />
                        </div>
                        <div className="flex justify-around pt-1">
                            <button
                                type="submit"
                                disabled={loading || liveCreation}
                                className={` text-purple-700 px-2 py-1 rounded w-full flex flex-inline items-center justify-around
                                ${liveCreation ? "bg-gray-300 hover:bg-gray-300" : "bg-purple-100 hover:bg-purple-200"}`} 
                            >
                                {loading ? 
                                    <span>Création...</span> 
                                :
                                    <>
                                        <span>Créer le live</span>
                                        <div className="flex items-center bg-orange-100 text-orange-700 font-semibold rounded-xl px-2 py-1 w-fit">
                                            <img src="./../img/token.png" alt="SwapTokens logo" className="w-5 h-5" />
                                            <span className='pl-1'>{livePrice}</span>
                                        </div>
                                    </>
                                }
                            </button>
                        </div>
                </form>
            </>
            )}
            {error && <div className="text-red-600 font-bold">{error}</div>}
            {success && <div className="text-green-600 font-bold">{success}</div>}
        </div>
    );
}

export default CreateMeetingPage;