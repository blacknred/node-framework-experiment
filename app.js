/* APP */

const APP = {
    models: {},
    controllers: {},
    routes: [],
    middleware: [],
};

/*  models */

class Car {
    constructor(cars = []) {
        cars = [].concat(cars);
        this.cars = [...cars];
    }
    getAll() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.cars), 500)
        });
    }
    addOne(name) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.cars.push(name)), 500)
        });
    }
}

APP.models.Car = new Car(['Audi r8', 'BMW i8', 'Ford Transit']);

/* controllers */

APP.controllers.getCars = (ctx) => {
    try {
        return APP.models.Car.getAll();
    } catch (err) {
        ctx.throw(err);
    }
};

APP.controllers.addCar = async (ctx) => {
    try {
        const {
            name
        } = ctx.req.body;
        await APP.models.Car.addOne(name);
        return {
            name
        };
    } catch (err) {
        ctx.throw(err);
    }
};

/* routes */

APP.routes.push(...[{
        method: 'GET',
        url: '/api/cars',
        handler: APP.controllers.getCars
    },
    {
        method: 'POST',
        url: '/api/cars',
        // middleware: [],
        handler: APP.controllers.addCar
    },
]);

/* middleware */
APP.middleware.push(...[
    (async (ctx, next) => {
        ctx.log('mddlwr2');
        await next();
    }),
    (async (ctx, next) => {
        setTimeout(async () => {
            ctx.log('mddlwr3');
            await next();
        }, 100)
    })
]);

module.exports = {
    routes: APP.routes,
    middleware: APP.middleware
};