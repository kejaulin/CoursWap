const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');

router.get('/google', authController.googleAuthenticate);

router.get('/google/callback', authController.googleCallback);

router.post('/logout', authController.userLogout);

router.get('/current_user', authController.getCurrentUser);

router.post('/login', authController.userLocalLogin);

router.post('/register', authController.userRegister);

module.exports = router;