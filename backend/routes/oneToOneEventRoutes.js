const express = require('express');
const router = express.Router();
const OneToOneEvent = require('../models/OneToOneEvent');

router.post('/create', async (req, res) => {
    try {
        
      const { profId, oneToOneEventId, date, heure, mode, location } = req.body;
      const etudiantId = req.user._id;
      // Vérifie que tous les champs requis sont présents
      if ( !profId || !oneToOneEventId || !date || !heure || !mode) {
        return res.status(400).json({ success: false, error: "Tous les champs sont requis" });
      }
    
      // Crée la nouvelle réunion
      const newOneToOneEvent = new OneToOneEvent({
        etudiantId,
        profId,
        oneToOneEventId,
        date,
        heure,
        mode,
        location
      });
      await newOneToOneEvent.save();
      return res.status(201).json({ success: true, meeting: newOneToOneEvent });
    } catch (error) {
    console.error("Erreur création meeting :", error);
    return res.status(500).json({ error: 'Erreur serveur lors de la création du meeting' });
  }
});

router.get('/my-meetings', async (req, res) => {
  try {
    const userId = req.user._id;
      const OneToOneEvents = await OneToOneEvent.find ({
        $or: [
        { etudiantId: userId },
        { profId: userId }
      ]
    })
    .populate('profId','nom')
    .populate('etudiantId','nom')
    .lean()
    .sort({ date: 1 });  // tri par date croissante
    res.json(OneToOneEvents);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;