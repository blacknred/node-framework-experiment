const F = require('./framework');

const f = new F();

// [fn,]
f.add((ctx, next) => {
    ctx.log('mddlwr1');
    next();
});

// start
f.run();