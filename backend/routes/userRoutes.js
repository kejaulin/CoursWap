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




module.exports = router;
