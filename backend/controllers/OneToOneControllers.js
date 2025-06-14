
const oneToOneEventService = require('../services/oneToOneEventService');


exports.createOneToOneEvent = async (req, res) => {
  try {
    const etudiantId = req.user._id;
    const meeting = await oneToOneEventService.createOneToOneEvent({ ...req.body, etudiantId });
    res.status(201).json({ success: true, meeting });
  } catch (err) {
    console.error("Erreur création :", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOneToOneEvent = async (req, res) => {
  try {
    const meetings = await oneToOneEventService.getOneToOneEventForUser(req.user._id);
    res.json(meetings);
  } catch (err) {
    console.error("Erreur récupération :", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOneToOneEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await oneToOneEventService.deleteOneToOneEvent(id);
    res.json({ success: true, message: 'Réunion supprimée avec succès', ...result });
  } catch (err) {
    console.error('Erreur contrôleur suppression :', err.message);
    res.status(500).json({ error: err.message });
  }
};
