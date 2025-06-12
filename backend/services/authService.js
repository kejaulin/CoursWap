const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class AuthService {
    constructor() {
        this.oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        // Scopes nécessaires pour l'API Google Forms
        this.SCOPES = [
            'https://www.googleapis.com/auth/forms',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ];
    }

    async authorize() {
        try {
            // Vérifier si nous avons déjà un token valide
            if (this.oauth2Client.credentials) {
                return this.oauth2Client;
            }

            // Générer l'URL d'autorisation
            const authUrl = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
                prompt: 'consent'
            });

            // Si nous n'avons pas de token, nous devons rediriger l'utilisateur vers l'URL d'autorisation
            if (!this.oauth2Client.credentials) {
                throw new Error(`Veuillez vous authentifier en visitant: ${authUrl}`);
            }

            return this.oauth2Client;
        } catch (error) {
            throw new Error(`Erreur d'authentification: ${error.message}`);
        }
    }

    async handleCallback(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            return tokens;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération du token: ${error.message}`);
        }
    }

    async refreshToken() {
        try {
            if (!this.oauth2Client.credentials.refresh_token) {
                throw new Error('Aucun refresh token disponible');
            }

            const { credentials } = await this.oauth2Client.refreshAccessToken();
            this.oauth2Client.setCredentials(credentials);
            return credentials;
        } catch (error) {
            throw new Error(`Erreur lors du rafraîchissement du token: ${error.message}`);
        }
    }

    async revokeToken() {
        try {
            if (this.oauth2Client.credentials.access_token) {
                await this.oauth2Client.revokeToken(this.oauth2Client.credentials.access_token);
                this.oauth2Client.setCredentials({});
            }
            return true;
        } catch (error) {
            throw new Error(`Erreur lors de la révocation du token: ${error.message}`);
        }
    }

    async getUserInfo() {
        try {
            const oauth2 = google.oauth2({
                auth: this.oauth2Client,
                version: 'v2'
            });

            const { data } = await oauth2.userinfo.get();
            return data;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des informations utilisateur: ${error.message}`);
        }
    }
}

module.exports = new AuthService(); 