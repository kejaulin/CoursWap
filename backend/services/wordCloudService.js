const request = require('request');
const WordCloud = require('../models/WordCloud');

const generateWordCloud = (text) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: 'https://textvis-word-cloud-v1.p.rapidapi.com/v1/textToCloud',
            headers: {
                'x-rapidapi-host': 'textvis-word-cloud-v1.p.rapidapi.com',
                'x-rapidapi-key': '44366be14cmsh09cb33bda829e27p116e52jsn1e398e018ed0',
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: {
                text: text,
                scale: 2,
                width: 800,
                height: 800,
                colors: ['#375E97', '#FB6542', '#FFBB00', '#3F681C'],
                font: 'Tahoma',
                use_stopwords: false,
                language: 'en',
                uppercase: true
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

const getWordCloudById = async (id) => {
    try {
        const wordCloud = await WordCloud.findById(id);
        if (!wordCloud) throw new Error('Word cloud not found');
        return wordCloud;
    } catch (error) {
        throw new Error(`Error fetching word cloud: ${error.message}`);
    }
};

module.exports = {
    generateWordCloud, 
    getWordCloudById
};