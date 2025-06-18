const App = require('../models/App');
require('dotenv').config();
const PLATFORM_NAME = process.env.PLATFORM_NAME || "CoursWap";

async function useAppTokenApiKey(req, res, next) {
  try {
    const app = await App.findOne({ name: PLATFORM_NAME }).select({ tokenAPIKey: 1, _id: 0 });

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    req.appTokenApiKey = app.tokenAPIKey;
    next();
  } catch (error) {
    console.error('Error in useAppTokenApiKey middleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = useAppTokenApiKey;
