const tokenService = require('../services/tokenService');
const App = require('../models/App');

exports.webhookInfos = async (req, res) => {
  const { event, appName, regeneratedAt } = req.body;

  if (!event || !appName || !regeneratedAt) {
    return res.status(400).json({ error: 'Payload invalide ou incomplet' });
  }

  try {
    if (event === 'tokens_regenerated') {
      console.log(`[WEBHOOK] Tokens régénéré à ${regeneratedAt}`);

      await tokenService.handleTokensRegenerated(appName, regeneratedAt);

      const app = await App.findOne({ name: appName });
      const io = req.app.get('io');
      io.to(app._id).emit('tokens_regenerated', { regeneratedAt });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Type d’événement non supporté' });
  } catch (err) {
    console.error('Erreur lors du traitement:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
