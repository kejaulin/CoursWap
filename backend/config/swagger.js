const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CoursWap API',
            version: '1.0.0',
            description: 'Documentation de l\'API CoursWap',
        },
        servers: [
            {
                url: `http://localhost:${process.env.SERVER_PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(swaggerOptions); 