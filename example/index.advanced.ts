import F from '../lib';

import {
    routes: restRoutes,
    middleware: restMiddlewares
} from './app';

const f: <F> = new F({
    timer: boolean = true,
    port: number = 4000
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


