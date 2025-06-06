import React,{use, useRef, useCallback,useState, useEffect} from 'react';
import {APIProvider,Map,Pin,AdvancedMarker,useMap} from '@vis.gl/react-google-maps';

const GMAP_APIKey = import.meta.env.VITE_GMAP_PLATFORM_API_KEY;

const PoiMarkers = ({props, onLocationSelect}) => {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const map = useMap();
 
    const handleClick = useCallback((ev) => {
        if(!map) return;        
        if(!ev.location) return;
        setSelectedMarker(ev);
        map.panTo(ev.location);
        fetch('/api/meetings/reverse-geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ev.location),
        }).then(res => res.json()).then(data => {if(onLocationSelect) onLocationSelect({address:data})});
    });
    return (
      <>
        {props.map( (poi) => (
          <AdvancedMarker
            key={poi.key}
            position={poi.location}
            clickable={true}
            onClick={() => handleClick(poi)}
            >
            <Pin background={selectedMarker && selectedMarker.key === poi.key ? '#FB0000' : '#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
            <input type="hidden" name="location" required />
          </AdvancedMarker>
        ))}
      </>
    );
};

const MapRefBridge = ({ mapRef }) => {
  const map = useMap();

  useEffect(() => {
    if (map && !mapRef.current) {
      mapRef.current = map;
    }
  }, [map]);

  return null;
};
const GMAP = ({ infoType = undefined, poiMarkersList = [], onLocationSelect }) => {
  const [position, setPosition] = useState({ lat: 46.603354, lng: 1.888334 }); // France centering
  const [error, setError] = useState(null);
  const [selfCenterButton, showSelfCenterButton] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    if (infoType === "prof") {
      if (!navigator.geolocation) {
        setError("La géolocalisation n'est pas supportée.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          showSelfCenterButton(true);
          setError(null);
        },
        (err) => {
          setError("Permission refusée ou erreur de localisation.");
          console.warn(err);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    }
  },[infoType]
  );

  const handleUserLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPos);
        if (mapRef.current) {
          mapRef.current.panTo(newPos);
        }
      },
      (err) => {
        alert("Permission refusée ou erreur de localisation.");
        console.warn(err);
      }
    );
  };

  const handlePoiLocationSelect = (location) => {
    const address = location.address || `${location.lat}, ${location.lng}`;
    setSelectedAddress(address);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="map-container">
      {selectedAddress && (
        <p className="mt-2 text-sm text-gray-800 px-4">
          <strong>Lieu sélectionné :</strong> {selectedAddress.address}
        </p>
      )}
      <div className="map-placeholder overflow-hidden relative">
        {selfCenterButton && (
        <button className="absolute bottom-4 right-4 z-10 mt-4 bg-[#6842B9] text-white border-none px-3 py-1 rounded-full cursor-pointer transition-colors duration-300 hover:bg-[#5a38a0]"
        type="button" onClick={handleUserLocation}>
            <span className='text-xs'>Recentrer sur ma position</span>
        </button>
        )}
        <APIProvider apiKey={GMAP_APIKey}>
        <Map
          mapId={(infoType && infoType + "_MAP_ID") || "DEMO_MAP_ID"}
          style={{ width: "100%", height: "100%" }}
          defaultCenter={position} // initial center only
          defaultZoom={5}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
        <MapRefBridge mapRef={mapRef} />
          {infoType && poiMarkersList.length > 0 && (
            <PoiMarkers props={poiMarkersList} onLocationSelect={handlePoiLocationSelect} />
          )}
        </Map>
      </APIProvider>
      </div>
    </div>
  );
};

export default GMAP;