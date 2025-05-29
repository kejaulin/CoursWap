import React from 'react';
import {APIProvider,Map} from '@vis.gl/react-google-maps';

const GMAP_APIKey = import.meta.env.VITE_GMAP_PLATFORM_API_KEY;

const GMAP = () => (
    <APIProvider apiKey={GMAP_APIKey}>
        <Map
            style ={{width: '100vw',height:'100vh'}}
            defaultCenter={{lat: 22.54992, lng: 0}}
            defaultZoom={3}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
        />
    </APIProvider>
);

export default GMAP;