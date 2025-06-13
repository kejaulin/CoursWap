const request = require('request');
const WordCloud = require('../models/WordCloud');

const generateWordCloud = (text) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: 'https://textvis-word-cloud-v1.p.rapidapi.com/v1/textToCloud',
            headers: {
                'x-rapidapi-host': 'textvis-word-cloud-v1.p.rapidapi.com',
                'x-rapidapi-key': 'YOUR_API_KEY', // 🔁 Remplace avec ta clé
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: {
                text,
                scale: 2,
                width: 800,
                height: 800,
                colors: ['#375E97', '#FB6542', '#FFBB00', '#3F681C'],
                font: 'Tahoma',
                use_stopwords: true,
                language: 'en',
                uppercase: false
            },
            json: true
        };

        request(options, async (error, response, body) => {
            if (error) return reject(error);
            try {
                const savedCloud = await WordCloud.create({ image: body });
                resolve(savedCloud);
            } catch (err) {
                reject(err);
            }
        });
    });
};

module.exports = {
    generateWordCloud
};
