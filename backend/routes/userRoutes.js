const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const userController = require('../controllers/userController');

const upload = multer({ dest: 'uploads/' });
// Middleware d'auth pour être sûr que req.user existe (sinon erreur 401)
function ensureAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ success: false, error: "Non authentifié" });
}

router.post('/register', ensureAuth, upload.single('photo'), userController.registerUser);


router.get('/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    return res.status(401).json({ error: "Non authentifié" });
  }
});

// Obtenir tous les professeurs
router.get('/', async (req, res) => {
  try {
    const profs = await User.find({ role: "professeur" });
    res.json(profs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}/addresses:
 *   get:
 *     summary: Récupérer les adresses associées à un utilisateur
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur (professeur)
 *     responses:
 *       200:
 *         description: Liste des adresses du professeur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meetingLocations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         description: Identifiant unique de l'adresse
 *                       location:
 *                         type: object
 *                         properties:
 *                           street:
 *                             type: string
 *                             description: Rue
 *                           city:
 *                             type: string
 *                             description: Ville
 *                           postalCode:
 *                             type: string
 *                             description: Code postal
 *                           country:
 *                             type: string
 *                             description: Pays
 *       404:
 *         description: Aucune adresse trouvée pour ce professeur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Aucune adresse trouvée pour ce professeur
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Message d'erreur
 */
router.get('/:id/addresses', userController.profAddresses);

/**
 * @swagger
 * /users/{id}/saveaddresses:
 *   put:
 *     summary: Remplace les adresses de réunion d’un utilisateur
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID MongoDB de l'utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetingLocations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       example: maison
 *                     location:
 *                       type: object
 *                       properties:
 *                         add:
 *                           type: string
 *                           example: 123 rue de Paris, 75000 Paris
 *           example:
 *             meetingLocations:
 *               - key: maison
 *                 location:
 *                   add: 123 rue de Paris, 75000 Paris
 *               - key: travail
 *                 location:
 *                   add: 78 avenue Victor Hugo, 75016 Paris
 *     responses:
 *       200:
 *         description: Adresses mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Meeting locations updated
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/saveaddresses', userController.geocode );

module.exports = router;