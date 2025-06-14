const addressCache = require('../models/addressCache');

const userService = {

    async geocode(addresse) {
        const originalAddress  = [addresse.street, addresse.city,addresse.postalCode, addresse.country].filter(Boolean).map(s => s.trim()).join(', ');
        const cacheAddressInfos = await addressCache.findOne({originalAddress: originalAddress});
        if(cacheAddressInfos) return cacheAddressInfos;

        console.log("Appel de l'API geocode pour l'addresse: ", originalAddress);
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${originalAddress}&key=${process.env.GMAP_PLATFORM_API_KEY}`;
        const response = await fetch(geocodeUrl);
        const data = (await response.json()).results?.[0];
        if (!data) throw new Error('Address not found by Google API');
       
        const components = {};
        data.address_components.forEach(c => {
            if (c.types.includes("street_number")) components.streetNumber = c.long_name;
            if (c.types.includes("route")) components.route = c.long_name;
            if (c.types.includes("postal_code")) components.postalCode = c.long_name;
            if (c.types.includes("locality")) components.city = c.long_name;
            if (c.types.includes("administrative_area_level_1")) components.region = c.long_name;
            if (c.types.includes("country")) components.country = c.long_name;
        });
        try{
            const newCache = new addressCache({
                originalAddress,
                formattedAddress: data.formatted_address,
                lat: data.geometry.location.lat,
                lng: data.geometry.location.lng,
                ...components
            });
            await newCache.save();
            return newCache;
        }catch(err){
            console.error('Erreur lors de la sauvegarde :', err.message);
            if (err.code === 11000) {
                console.log('Doublon détecté sur un champ unique :', err.keyValue);
            }
            throw err;
        }
       
    },
};

module.exports = userService;