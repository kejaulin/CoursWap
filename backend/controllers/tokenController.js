const tokenService = require('../services/tokenService');

exports.webhookInfos = async (req, res) => {
  const { event, appId, regeneratedAt } = req.body;

  if (!event || !appId || !regeneratedAt) {
    return res.status(400).json({ error: 'Payload invalide ou incomplet' });
  }

  try {
    if (event === 'tokens_regenerated') {
      console.log(`[WEBHOOK] Tokens régénéré à ${regeneratedAt}`);

      await tokenService.handleTokensRegenerated(appId, regeneratedAt);

      const io = req.app.get('io');
      io.to(appId).emit('tokens_regenerated', { regeneratedAt });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Type d’événement non supporté' });
  } catch (err) {
    console.error('Erreur lors du traitement:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
