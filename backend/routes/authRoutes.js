const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth page
 */
router.get('/google', authController.initiateGoogleAuth);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to dashboard after successful authentication
 */
router.get('/google/callback', authController.handleGoogleCallback);

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get current user information
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User information
 */
router.get('/user', authController.getCurrentUser);

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Check authentication status
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authentication status
 */
router.get('/status', authController.checkAuthStatus);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authController.logout);

module.exports = router; 