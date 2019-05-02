const F = require('./core');
const {
    routes: restRoutes,
    middleware: restMiddlewares
} = require('./app');

const f = new F({
    timer: true,
    port: 4000
});

// [fn,]
f.use(async (ctx, next) => {
    await next();
    ctx.log('mddlwr1');
});

f.use(restMiddlewares);

// [conf,]
f.route({
    method: 'GET',
    path: '/api/ping',
    // responseSchema:
    // hooks(pre, after)
    handler: () => 'pong'
});

f.route(restRoutes);

// start
f.go();


