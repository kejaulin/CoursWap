const OneToOneEvent = require('../models/OneToOneEvent');

exports.getStats = async (req, res) => {
  try {
    const professeurs = await OneToOneEvent.aggregate([
      { $group: { _id: "$profId", totalCreneaux: { $sum: 1 } } },
      { $project: { id: "$_id", totalCreneaux: 1, _id: 0 } }
    ]);

    const etudiants = await OneToOneEvent.aggregate([
      { $group: { _id: "$etudiantId", totalCreneaux: { $sum: 1 } } },
      { $project: { id: "$_id", totalCreneaux: 1, _id: 0 } }
    ]);

    res.json({ professeurs, etudiants });
  } catch (err) {
    console.error("Erreur MapReduce backend :", err);
    res.status(500).json({ error: err.message });
  }
};