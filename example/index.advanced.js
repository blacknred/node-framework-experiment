const F = require('../lib').default;

const {
    routes: restRoutes,
    middleware: restMiddlewares
} = require('./app');

const f = new F({
    timer: true,
    port: 4000,
    asyncMiddleware: true,
});

// [fn,]
f.use(async (ctx, next) => {
    await next();
    ctx.log('mddlwr1');
});

f.use(restMiddlewares);

// [schema,]
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

// export {};