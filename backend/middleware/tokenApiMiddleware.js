const App = require('../models/App');

async function useAppTokenApiKey(req, res, next) {
  try {
    const app = await App.findOne({ name: "CoursWapFreddy" }).select({ tokenAPIKey: 1, _id: 0 });

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
