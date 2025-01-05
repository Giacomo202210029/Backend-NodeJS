const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express API with Swagger',
            version: '1.0.0',
            description: 'A simple CRUD API application made with Express and documented with Swagger',
        },
    },
    apis: ['./index.js'], // Archivos donde se documentarán las rutas
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};