const request = require('request');

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

        request(options, (error, response, body) => {
            if (error) return reject(error);
            resolve({image: body}); 
        });
    });
};

module.exports = {
    generateWordCloud
};