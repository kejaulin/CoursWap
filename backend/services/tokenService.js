const App = require('../models/App');
require('dotenv').config();

const PLATFORM_NAME = process.env.PLATFORM_NAME || "CoursWap";
const APP_Config = PLATFORM_NAME == "CoursWap" 
? {
    name: "CoursWap",
    max_token_value: 15,
    min_token_value: 0,
    token_regeneration_time: {
        days: 1,
        hours: 0,
        mins: 0
    }
  }
:
  {
    name: PLATFORM_NAME,
    max_token_value: 15,
    min_token_value: 0,
    token_regeneration_time: {
        days: 0,
        hours: 0,
        mins: 3
    }
  };

const tokenService = {
    async getAPIKey() {
        try {
            console.log("Call API Token Key generation");
            const res = await fetch("http://token-api-environment.eba-etwtnpg2.eu-west-1.elasticbeanstalk.com/api/apps/register",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(APP_Config)
            }).then(res => res.json());
            return res.apiKey;
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },

    async handleTokensRegenerated(appId, regeneratedAt){
        await App.findOneAndUpdate( { appId },
            { $set: {tokenRegeneratedDate: regeneratedAt} },
            { new: true });        
    }
}

module.exports = tokenService;