const wordCloudService = require('../services/wordCloudService');

const createWordCloud = async (req, res) => {
    try {
        const text = req.body.text || 'Default text for testing.';
        const wordCloud = await wordCloudService.generateWordCloud(text);
        res.json({ image: wordCloud.image });
    } catch (err) {
        console.error('Erreur:', err); // <--- Ajoute ceci
        res.status(500).send('Erreur lors de la génération du nuage de mots.');
    }
};

const getWordCloud = async (req, res) => {
    try {
        const id = req.params.id;
        const wordCloud = await wordCloudService.getWordCloudById(id);
        res.json({ image: wordCloud.image });
    } catch (err) {
        res.status(500).send('Erreur lors de la récupération du nuage de mots.');
    }
};

module.exports = {
    createWordCloud,
    getWordCloud
};
