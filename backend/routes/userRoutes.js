const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');

const upload = multer({ dest: 'uploads/' });

// Middleware d'auth pour être sûr que req.user existe (sinon erreur 401)
function ensureAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ success: false, error: "Non authentifié" });
}

router.post('/register', ensureAuth, upload.single('photo'), async (req, res) => {
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
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Non authentifié" });
  }
});

// Obtenir tous les professeurs
router.get('/', async (req, res) => {
  try {
    const profs = await User.find({ role: "professeur" });
    res.json(profs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtenir un professeur par ID

router.get('/:id', async (req, res) => {
  try {
    const prof = await User.findOne({ _id: req.params.id, role: "professeur" });
    if (!prof) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }
    return res.json(prof);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// Mettre à jour les disponibilités d'un professeur
router.put('/:id/disponibilites', ensureAuth, async (req, res) => {
  try {
    const { id } = req.params; 
    const { date, creneau } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

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

    res.json({ success: true, disponibilites: user.disponibilites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
