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

module.exports = new Car(['Audi r8', 'BMW i8', 'Ford Transit']);