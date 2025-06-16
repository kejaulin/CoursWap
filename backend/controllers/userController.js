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

exports.profAddresses = async (req, res) => {
    try {
        const profAddresses = await User.findOne({ _id: req.params.id}).select({meetingLocations:1, _id:0});
        if (!profAddresses.meetingLocations) {
            return res.status(404).json({ message: 'Aucune adresse trouvée pour ce professeur' });
        }
        return res.json(profAddresses);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.registerUser = async (req, res, user) => {
    try {
        // Récupère l’email de l’utilisateur connecté (Google)
        const email = req.user.email;
        const { nom, role, matiere, disponibilites } = req.body;
        let updateFields = { nom, role, email };
        if (req.file) updateFields.photo = `/uploads/${req.file.filename}`;
        if (role === 'professeur') {
          updateFields.matiere = matiere;
          updateFields.disponibilites = JSON.parse(disponibilites);
        }
    
        //  vérifie si le user existe déjà par email
        let user = await User.findOne({ email });
    
        if (user) {
          // Il existe, on met à jour
          user = await User.findOneAndUpdate(
            { email },
            { $set: updateFields },
            { new: true }
          );
        } else {
          // Sinon, on le crée
          user = new User(updateFields);
          await  user.save();
        }
    
        return res.status(200).json({ success: true, user });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

exports.getUserCurrentTokenAmount = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        const tokens = await userService.getUserCurrentTokenAmount(user, req.appTokenApiKey);
        return res.status(200).json( tokens );
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

exports.substractUserToken = async (req, res) => {
    try {
        const {amount} = req.body
        const newUserTokenAmount = await userService.substractUserToken(req.params.id, req.appTokenApiKey,amount);
        return res.status(200).json( newUserTokenAmount );
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}