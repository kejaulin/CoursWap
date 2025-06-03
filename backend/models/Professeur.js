const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProfesseurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  photo: { type: String }, 
  matiere: { type: String, required: true },
  disponibilites: [String] 
});

module.exports = mongoose.model('Professeur', ProfesseurSchema);