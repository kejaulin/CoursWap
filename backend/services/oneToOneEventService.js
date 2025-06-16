
const OneToOneEvent = require('../models/OneToOneEvent');
const User = require('../models/User');
const moment = require('moment');

exports.createOneToOneEvent = async ({ profId, etudiantId, date, heure, mode }) => {
  if (!profId || !etudiantId || !date || !heure || !mode) {
    throw new Error("Champs requis manquants");
  }

  const newMeeting = new OneToOneEvent({
    profId, etudiantId, date, heure, mode
  });

  await newMeeting.save();
  return newMeeting;
};

exports.getOneToOneEventForUser = async (userId) => {
  return await OneToOneEvent.find({
    $or: [{ etudiantId: userId }, { profId: userId }]
  })
    .populate('profId', 'nom')
    .populate('etudiantId', 'nom')
    .lean()
    .sort({ date: 1 });
};



exports.deleteOneToOneEvent = async (id) => {
  if (!id) throw new Error('ID manquant');

  const event = await OneToOneEvent.findById(id);
  if (!event) throw new Error('Réunion non trouvée');

  await OneToOneEvent.findByIdAndDelete(id);

  // Formater la date comme dans les disponibilités (ex: "15/06/2025")
  const formattedDate = moment(event.date).format("DD/MM/YYYY");

  const result = await User.updateOne(
    { _id: event.profId, "disponibilites.date": formattedDate },
    { $push: { "disponibilites.$.creneaux": event.heure } }
  );

  if (result.modifiedCount === 0) {
    console.warn(`Aucun créneau remis : la date ${formattedDate} n'existe pas dans les dispos`);
  }

  return { success: true };
};
