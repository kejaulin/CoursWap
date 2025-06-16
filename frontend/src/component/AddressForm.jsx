import { useEffect, useState } from 'react';

const AddressForm = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    fetch(`/api/users/${userId}/addresses`)
    .then((res) => res.json())
    .then((res) => {
      if (res.meetingLocations.length) setAddresses(res.meetingLocations);  
    })
  }, [userId]);

  const handleChange = (index, field, value) => {
    const updated = [...addresses];
    if(field === 'key'){
        updated[index].key = value;
    } else {
        updated[index].location[field] = value;
    }
    setAddresses(updated);
  };

  const addAddress = () => {
    setAddresses([...addresses, { key: '', location:{street: '', city: '', postalCode: '', country: '' }}]);
  };

  const saveAddresses = async () => {
    await fetch(`/api/users/${userId}/saveaddresses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses }),
    });
    alert('Adresses enregistrées !');
  };

  const removeAddress = (index) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  return (
  <div className="space-y-3">
    {addresses.map((addr, i) => (
      <div key={i} className="p-4 bg-white rounded-lg shadow border border-gray-200 relative">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Adresse n°{i + 1}</h3>
        <button
        onClick={() => removeAddress(i)}
        className="absolute top-2 right-2 bg-red-600 text-white w-25 h-9 rounded text-sm flex items-center justify-center hover:bg-red-700"
        title="Supprimer cette adresse"
        type="button">
          Supprimer &minus;
        </button>
        {/* Ligne 1 : Rue & Ville */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Rue</label>
            <input
              placeholder="Rue"
              value={addr.location.street}
              onChange={(e) => handleChange(i, 'street', e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Ville</label>
            <input
              placeholder="Ville"
              value={addr.location.city}
              onChange={(e) => handleChange(i, 'city', e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Ligne 2 : Code postal, Pays, Identifiant */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Code postal</label>
            <input
              placeholder="Code postal"
              value={addr.location.postalCode}
              onChange={(e) => handleChange(i, 'postalCode', e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Pays</label>
            <input
              placeholder="Pays"
              value={addr.location.country}
              onChange={(e) => handleChange(i, 'country', e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Identifiant</label>
            <input
              placeholder="Identifiant"
              value={addr.key}
              onChange={(e) => handleChange(i, 'key', e.target.value)}
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>
      </div>
    ))}

    {/* Footer des boutons */}
    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        type="button"
        onClick={addAddress}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow"
      >
        + Nouvelle adresse
      </button>
      <button type="button"
        onClick={saveAddresses}
        className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md shadow"
      >
        Enregistrer les adresses
      </button>
    </div>
  </div>

  );
};

export default AddressForm;
