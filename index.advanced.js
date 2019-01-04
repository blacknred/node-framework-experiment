const F = require('./framework');
const {
    routes: restRoutes,
    middleware: restMiddlewares
} = require('./app');

F.log('Lets setup advanced server!');

const f = new F({
    timer: true,
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