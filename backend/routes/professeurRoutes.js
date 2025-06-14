const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Obtenir tous les professeurs
router.get('/', async (req, res) => {
  try {
    const profs = await User.find( {role: 'professeur'}).select({disponibilities:1, nom: 1, role:1, matiere:1}).exec();
    res.json(profs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Obtenir un professeur par ID

router.get('/:id', async (req, res) => {
  try {
    const prof = await User.findById(req.params.id).select({disponibilities:1, nom: 1, role:1, matiere:1});
    if (!prof) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }
    return res.json(prof);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});




module.exports = router;