require('dotenv').config();
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ["https://www.googleapis.com/auth/calendar"];


const authService = {
    async getAuthorizedClient(user) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );

        oauth2Client.setCredentials({ refresh_token: user.refreshToken });

        try{
            const { token } = await oauth2Client.getAccessToken();
            user.accessToken = token;
            user.save();
            oauth2Client.setCredentials({ access_token: token });

            return oauth2Client;
        }catch(err){
            console.log(err);
            throw err;
        }
    },

};

module.exports = authService;