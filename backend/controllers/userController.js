const path = require('path');
const userService = require('../services/userService');

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
