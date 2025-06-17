const path = require('path');
const userService = require('../services/userService');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
  try {
    const email = req.user.email;
    const { nom, role, matiere, disponibilites } = req.body;
    let userData = { nom, role, email };

    if (req.file) {
      userData.photo = `/uploads/${req.file.filename}`;
    }
    if (role === 'professeur') {
      userData.matiere = matiere;
      userData.disponibilites = JSON.parse(disponibilites);
    }

    const user = await userService.registerOrUpdateUser(email, userData);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMe = (req, res) => {
  if (req.user) return res.json(req.user);
  res.status(401).json({ error: "Non authentifié" });
};

exports.getAllProfs = async (req, res) => {
  try {
    const profs = await userService.getAllProfs();
    res.json(profs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfById = async (req, res) => {
  try {
    const prof = await userService.getProfById(req.params.id);
    if (!prof) return res.status(404).json({ message: 'Professeur non trouvé' });
    res.json(prof);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDisponibilites = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, creneau } = req.body;
    const disponibilites = await userService.updateDisponibilites(id, date, creneau);
    res.json({ success: true, disponibilites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
};

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
};

exports.getUserCurrentTokenAmount = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        const tokens = await userService.getUserCurrentTokenAmount(user, req.appTokenApiKey);
        return res.status(200).json( tokens );
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

exports.substractUserToken = async (req, res) => {
    try {
        const {amount} = req.body
        const newUserTokenAmount = await userService.substractUserToken(req.params.id, req.appTokenApiKey,amount);
        return res.status(200).json( newUserTokenAmount );
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};