const F = require('./framework');
const {
    routes: restRoutes,
    middleware: restMiddlewares
} = require('./app');

const f = new F({
    timer: true,
    port: 4000
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
    path: '/api/ping',
    // schema:
    // middleware
    handler: () => 'pong'
});

f.route(restRoutes);

// start
f.go();


// curl -d "name=volvo xc90" -X POST http://localhost:3003/api/cars

