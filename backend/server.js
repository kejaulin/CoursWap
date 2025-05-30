const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');

require("dotenv").config();
require('./models/User');
require('./services/passport');

const app = express();
const PORT = process.env.SERVER_PORT;

mongoose.connect('mongodb://localhost/cours-wap-bdd').then(() => {
    console.log('Connected to MongoDB.');
  }).catch(error => {
    console.error(error);
  });

app.use(bodyParser.json());
app.use(cors({origin:'http://localhost:3000',credentials:true}));

// OAuth --
app.use(
  cookieSession({
    maxAge: 30*24*60*60*1000,
    keys: [process.env.COOKIE_KEY]
  })
);
app.use(passport.initialize());
app.use(passport.session());
require('./routes/authRoutes')(app);
// --------

app.get('/courswap', (req, res) => {
  res.send({'temp':'Hello from MERN stack!'});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});