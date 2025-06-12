const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_2024';

const authenticateToken = (req, res, next) => {
    // Vérifier si c'est une requête Swagger UI
    const isSwaggerRequest = req.path.startsWith('/api-docs');
    if (isSwaggerRequest) {
        return next();
    }

    // obtenir le token du header Authorization
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader) {
        token = authHeader.split(' ')[1];
    } else if (req.session && req.session.token) {
        // Si pas de token dans le header, essayer d'utiliser celui de la session
        token = req.session.token;
    }

    if (!token) {
        console.log('No token found in Authorization header or session');
        return res.status(401).json({ 
            authenticated: false,
            message: "Token manquant dans l'en-tête Authorization ou la session"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({ 
                authenticated: false,
                message: "Token invalide ou expiré"
            });
        }
        console.log('Token verified successfully for user:', user);
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateToken
}; 