const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');


router.post('/create', async (req, res) => {
    try {
        
        const { profId, meetingId, date, heure, mode, meetingLocations } = req.body;
        const etudiantId = req.user._id;
        // Vérifie que tous les champs requis sont présents
        if ( !profId || !meetingId || !date || !heure || !mode) {
        return res.status(400).json({ success: false, error: "Tous les champs sont requis" });
        }
    
        // Crée la nouvelle réunion
        const newMeeting = new Meeting({
        etudiantId,
        profId,
        meetingId,
        date,
        heure,
        mode,
        meetingLocations
        });
    
        await newMeeting.save();

        res.status(201).json({ success: true, meeting: newMeeting });
    } catch (error) {
    console.error("Erreur création meeting :", error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du meeting' });
  }
});


router.get('/my-meetings', async (req, res) => {
    try {
     const userId = req.user._id;
      const meetings = await Meeting.find ({
        $or: [
        { etudiantId: userId },
        { profId: userId }
      ]
    }).sort({ date: 1 });  // tri par date croissante
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;