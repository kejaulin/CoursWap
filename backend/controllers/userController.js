const userService = require('../services/userService');
const User = require('../models/User');

exports.geocode = async (req,res) =>{
    try{
        const userId = req.params.id;
        const meetingLocations = req.body.addresses;
        const updatedAddresses = [];
        for(const{key, location} of meetingLocations){
            const cacheAddressInfos = await userService.geocode(location);
            updatedAddresses.push({
                key,
                location:{
                    ...location,
                    lat: cacheAddressInfos.lat,
                    lng: cacheAddressInfos.lng,
                    formattedAddress: cacheAddressInfos.formattedAddress
                }
            });
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {meetingLocations: updatedAddresses },
                { new: true }
            );

            if (!updatedUser) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            return res.status(200).json({
                message: 'Liste des adresses mise à jour avec succès.',
                updatedAddresses: updatedUser.meetingLocations,
            });
        } catch (err) {
            return res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }       
    } catch (err){
        return res.status(500).json({ error: err.message });   
    }
}