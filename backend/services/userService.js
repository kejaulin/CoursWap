const User = require('../models/User');
const addressCache = require('../models/addressCache');

const userService = {
    async registerOrUpdateUser(email, userData){
        let user = await User.findOne({ email });
        if (user) {
            user = await User.findOneAndUpdate({ email }, { $set: userData }, { new: true });
        } else {
            user = new User(userData);
            await user.save();
        }
        return user;
    },
  
    async getProfById(id) {
        return await User.findOne({ _id: id, role: "professeur" });
    },
  
    async getAllProfs() {
        return await User.find({ role: "professeur" });
    },
  
    async updateDisponibilites(id, date, creneau) {
        const user = await User.findById(id);
        if (!user) throw new Error('Utilisateur non trouvé');

        user.disponibilites = user.disponibilites.map(d => {
            if (d.date === date) {
                return {
                  ...d,
                  creneaux: d.creneaux.filter(c => c !== creneau)
                };
            }
            return d;
        });

        await user.save();
        return user.disponibilites;
    },

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

    async getUserCurrentTokenAmount(user, apiKey) {
        const userId = user._id;
        const userTokenInfos = await fetch(`http://token-api-environment.eba-etwtnpg2.eu-west-1.elasticbeanstalk.com/api/tokens/${userId}`,
            { method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } }).then(res =>{ return res.json()});
        return userTokenInfos.tokens;
    },

    async substractUserToken(userId, apiKey,amount) {
        const newUserTokenAmount = await fetch(`http://token-api-environment.eba-etwtnpg2.eu-west-1.elasticbeanstalk.com/api/tokens/${userId}/subtract`,
            { method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
            body: JSON.stringify({ amount: amount })
         }).then(res =>{ return res.json()});
        return newUserTokenAmount.tokens;
    },

    async addUserToken(userId, apiKey,amount) {
        const newUserTokenAmount = await fetch(`http://token-api-environment.eba-etwtnpg2.eu-west-1.elasticbeanstalk.com/api/tokens/${userId}/add`,
            { method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
            body: JSON.stringify({ amount: amount })
         }).then(res =>{ return res.json()});
        return newUserTokenAmount.tokens;
    },
};

module.exports = userService;