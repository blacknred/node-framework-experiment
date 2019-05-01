/* routes */

const {
    getCars,
    addCar,
} = require('./controllers');

module.exports = [{
        method: 'GET',
        path: '/api/cars',
        handler: getCars
    },
    {
        method: 'POST',
        path: '/api/cars',
        // middleware: [],
        handler: addCar
    }
];