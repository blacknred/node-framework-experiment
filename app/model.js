const { Readable } = require('stream');

class Car {
    constructor(...cars) {
        this.cars = cars;
    }
    getAll() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.cars), 1500)
        });
    }
    addOne(name) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.cars.push(name)), 500)
        });
    }
    getPrices() {
        const file = Buffer.alloc(50000);
        const stream = new Readable();
        stream.push(file);
        stream.push(null);
        return stream;
    }
}

module.exports = new Car(['Audi r8', 'BMW i8', 'Ford Transit']);