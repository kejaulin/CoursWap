const User = require('../models/User');

exports.registerOrUpdateUser = async (email, userData) => {
  let user = await User.findOne({ email });
  if (user) {
    user = await User.findOneAndUpdate({ email }, { $set: userData }, { new: true });
  } else {
    user = new User(userData);
    await user.save();
  }
  return user;
};

exports.getProfById = async (id) => {
  return await User.findOne({ _id: id, role: "professeur" });
};

exports.getAllProfs = async () => {
  return await User.find({ role: "professeur" });
};

exports.updateDisponibilites = async (id, date, creneau) => {
  const user = await User.findById(id);
  if (!user) throw new Error('Utilisateur non trouvé');

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
  return user.disponibilites;
};
