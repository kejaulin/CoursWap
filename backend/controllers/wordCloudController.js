const wordCloudService = require('../services/wordCloudService');

const createWordCloud = async (req, res) => {
    try {
        const text = req.body.text || 'Default text for testing.';
        const wordCloud = await wordCloudService.generateWordCloud(text);
        res.render('wordcloud', { image: wordCloud.image });
    } catch (err) {
        res.status(500).send('Erreur lors de la génération du nuage de mots.');
    }
};

module.exports = {
    createWordCloud
};
