const express = require('express');
const router = express.Router();
const Professeur = require('../models/Professeur');

// Obtenir tous les professeurs
router.get('/', async (req, res) => {
  try {
    const profs = await Professeur.find();
    res.json(profs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir un professeur par ID

router.get('/:id', async (req, res) => {
  try {
    const prof = await Professeur.findById(req.params.id);
    if (!prof) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }
    return res.json(prof);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});




module.exports = router;