const authService = require('../services/authService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_2024';

class AuthController {
    // Initiate Google OAuth flow
    initiateGoogleAuth(req, res) {
        try {
            const authUrl = authService.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: authService.SCOPES,
                prompt: 'consent'
            });
            res.redirect(authUrl);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Handle Google OAuth callback
    async handleGoogleCallback(req, res) {
        try {
            const { code } = req.query;
            const tokens = await authService.handleCallback(code);
            
            // Get user info
            const userInfo = await authService.getUserInfo();
            
            // Create JWT token
            const token = jwt.sign(
                { 
                    id: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.name
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Store token in session
            req.session.token = token;
            
            // Set token in response header
            res.setHeader('Authorization', `Bearer ${token}`);
            
            // For Swagger UI testing, return JSON response
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json({
                    token,
                    user: userInfo
                });
            }
            
            // For normal flow, redirect to frontend
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Callback error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get current user info
    async getCurrentUser(req, res) {
        try {
            if (!req.session.token) {
                return res.status(401).json({ error: 'Non authentifié' });
            }
            const userInfo = await authService.getUserInfo();
            res.json(userInfo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Logout user
    async logout(req, res) {
        try {
            await authService.revokeToken();
            req.session = null;
            res.json({ message: 'Déconnexion réussie' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Check authentication status
    checkAuthStatus(req, res) {
        if (req.session && req.session.token) {
            try {
                const decoded = jwt.verify(req.session.token, JWT_SECRET);
                res.json({ 
                    authenticated: true,
                    user: decoded,
                    token: req.session.token
                });
            } catch (err) {
                console.error('Token verification error:', err);
                res.json({ 
                    authenticated: false,
                    message: "Token invalide ou expiré"
                });
            }
        } else {
            res.json({ 
                authenticated: false,
                message: "Non authentifié"
            });
        }
    }
}

module.exports = new AuthController(); 