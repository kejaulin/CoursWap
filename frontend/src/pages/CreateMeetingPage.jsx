import { useState } from 'react';

function CreateMeetingPage({ onMeetingCreated }) {
    const [summary, setSummary] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Met à jour endDateTime automatiquement quand startDateTime change
    const handleStartChange = (e) => {
        const start = e.target.value;
        setStartDateTime(start);
        if (start) {
            const startDate = new Date(start);
            const endDate = new Date(startDate.getTime() + 30 * 60000); // +30min
            // Format pour input datetime-local
            const pad = n => n.toString().padStart(2, '0');
            const local = `${startDate.getFullYear()}-${pad(startDate.getMonth()+1)}-${pad(startDate.getDate())}T${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
            const localEnd = `${endDate.getFullYear()}-${pad(endDate.getMonth()+1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
            setEndDateTime(localEnd);
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
                body: JSON.stringify({ summary, startDateTime: startISO, endDateTime: endISO })
            });
            let data = {};
            try { data = await res.json(); } catch {}
            if (!res.ok) {
                setError(data.error || 'Erreur lors de la création du meeting');
            } else {
                setSuccess('Meeting créé avec succès !');
                setSummary('');
                setStartDateTime('');
                setEndDateTime('');
                if (onMeetingCreated) onMeetingCreated();
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-purple-100 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Créer un nouveau meeting</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold">Sujet du meeting</label>
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
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                    {loading ? 'Création...' : 'Créer le meeting'}
                </button>
                {error && <div className="text-red-600">{error}</div>}
                {success && <div className="text-green-600">{success}</div>}
            </form>
        </div>
    );
}

export default CreateMeetingPage;