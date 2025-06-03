const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require("dotenv").config();

const app = express();
const PORT = process.env.SERVER_PORT;


mongoose.connect('mongodb://localhost/cours-wap-bdd').then(() => {
    console.log('Connected to MongoDB.');
  }).catch(error => {
    console.error(error);
  });

app.use(bodyParser.json());
app.use(cors());

app.get('/courswap', (req, res) => {
  res.send({'temp':'Hello from MERN stack!'});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
}); 
const professeursRoutes = require('./routes/professeur.js');
app.use('/api/professeurs', professeursRoutes);
