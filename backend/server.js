require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

// Import configurations
const swaggerSpec = require('./config/swagger');
require('./config/passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB.'))
    .catch(error => console.error('MongoDB connection error:', error));

// Middleware
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
app.use(cookieSession({
    name: 'session',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    keys: [process.env.COOKIE_KEY || 'your-secret-key'],
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Session:', req.session);
    next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', formRoutes);

// Simple test route
app.get('/api/courses', (req, res) => {
    res.send({'allCourses': ["Maths", "Français", "Physique", "Chimie"]});
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});