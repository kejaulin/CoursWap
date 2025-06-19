require('dotenv').config();
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ["https://www.googleapis.com/auth/calendar"];


const authService = {
    async getAuthorizedClient(user) {
        console.log('getAuthorizedClient: user.refreshToken =', user.refreshToken);
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

    async subscribeToTokenAPI(user, apiKey) {
        const userId = user._id;
        await fetch(`http://token-api-environment.eba-etwtnpg2.eu-west-1.elasticbeanstalk.com/api/tokens/register`,
            { method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
            body: JSON.stringify({ userId, initialTokens: 7 }) });
    },
};

module.exports = authService;