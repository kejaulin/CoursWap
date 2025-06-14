const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');

require("dotenv").config();
require('./models/User');
require('./services/googleAuthService');
require('./services/localAuthService');
const tokenService = require('./services/tokenService');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
const PORT = process.env.SERVER_PORT;

const meetRoutes = require('./routes/meetRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const professeursRoutes = require('./routes/professeurRoutes');
const oneToOneEventRoutes = require('./routes/oneToOneEventRoutes');

const MyApp = require('./models/App');

mongoose.connect('mongodb://localhost/cours-wap-bdd').then(() => {
    console.log('Connected to MongoDB.');
  }).catch(error => {
    console.error(error);
});

app.use(bodyParser.json());
app.use(cors({origin:'http://localhost:3000',
  methods: "GET,POST,PUT,DELETE",
  credentials:true}));

// OAuth and others --
app.use(
  cookieSession({
    maxAge: 30*24*60*60*1000,
    keys: [process.env.COOKIE_KEY]
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth',authRoutes);
// --------

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CoursWap API',
      version: '1.0.0',
      description: 'Documentation de l’API CoursWap',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/meetings', meetRoutes);

app.get('/courses', (req, res) => {
  res.send({'allCourses':["Mathématiques","Français","Physique","Chimie"]});
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}.`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  // App first initialization
  const savedApp = await MyApp.findOne({name: "CoursWap"});
  if (!savedApp) {
      const tokenAPIKey = await tokenService.getAPIKey();
      const app = new MyApp({name: "CoursWap", tokenAPIKey: tokenAPIKey});
      app.save();
  } 
  // --------
}); 

app.use('/professeurs', professeursRoutes);

app.use('/users', userRoutes);

app.use('/onetooneevents', oneToOneEventRoutes );

const calendarRoutes = require('./routes/calendarRoutes');
app.use('/calendar', calendarRoutes);
