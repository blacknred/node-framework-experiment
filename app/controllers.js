const Car = require('./model');

function getCars(ctx) {
    try {
        return Car.getAll();
    } catch (err) {
        ctx.throw(err);
    }
};

async function addCar(ctx) {
    try {
        const {
            name
        } = ctx.req.body;
        await Car.addOne(name);
        return {
            name
        };
    } catch (err) {
        ctx.throw(err);
    }
};

module.exports = {
    getCars,
    addCar,
}