/* routes */

const {
    getCars,
    addCar,
    getPrices
} = require('./controllers');

module.exports = [{
        method: 'GET',
        path: '/api/cars',
        handler: getCars
    },
    {
        method: 'GET',
        path: '/api/cars/prices',
        // middleware: [],
        responseSchema: null,
        handler: getPrices
    },
    {
        method: 'POST',
        path: '/api/cars',
        // middleware: [],
        handler: addCar
    }
];