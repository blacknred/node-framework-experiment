const F = require('./framework');
const restRoutes = require('./app');
const restMiddlewares = require('./middlewares');

const f = new F({
    port: 3003,
});

// [fn,]
f.add(async (ctx, next) => {
    await next();
    ctx.log('mddlwr1');
});

f.add(restMiddlewares);

// [conf,]
f.route({
    method: 'GET',
    url: '/api/ping',
    // schema:
    // middleware
    handler: () => 'pong'
});

f.route(restRoutes);

// start
f.go();