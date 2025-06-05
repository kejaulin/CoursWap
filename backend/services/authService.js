require('dotenv').config();
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ["https://www.googleapis.com/auth/calendar"];


const authService = {
    async loadSavedCredentialsIfExist() {
        try {
            const {
                GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET,
                GOOGLE_REFRESH_TOKEN,
                GOOGLE_REDIRECT_URI
            } = process.env;
            
            if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GOOGLE_REDIRECT_URI) {
                console.error('Missing Google credentials in environment variables.');
                return null;
            }
            const credentials = {
                type: 'authorized_user',
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: GOOGLE_REFRESH_TOKEN,
                redirect_uris: [GOOGLE_REDIRECT_URI],
            };

            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    },

    async saveCredentials(client) {
        console.log('refresh token to save is', client.credentials.refresh_token);
    },

    async authorize() {
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }

        client = await authenticate({
            scopes: SCOPES,
            clientOptions:{
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                redirectUri: process.env.GOOGLE_REDIRECT_URI
            }
        })

        if (client.credentials) {
            await this.saveCredentials(client);
        }
        return client;
    }
};

module.exports = authService;