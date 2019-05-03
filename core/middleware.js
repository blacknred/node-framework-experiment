const url = require('url');
const qs = require('querystring');

const {
    isReadable
} = require('./helpers');

/** Description of the ctx
 * @typedef {Object} Ctx- The request context object.  
 * @property {Object} req The request object.  
 * @property {Object} res The response object.
 * @property {number} timestamp The request timestamp.
 * @property {Function} log The logger utility method.
 */

/** Description of the route
 * @typedef {Object} Route The route object. 
 * @property {string} method The request http method.
 * @property {string} path The request endpoint url.
 * @property {function} handler The request handler.
 * @property {function} before The middleware before request handler.
 * @property {function} after The middleware after request handler.
 * @property {object} responseSchema The response api schema.
 */

/**
 * The next callback.
 * @callback Next- The next middleware
 * @param {Ctx} ctx
 * @param {Next} next
 */

 /** Resolver middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
async function resolver(ctx, next) {
    ctx.res.statusCode = 200;
    await next();
    if (isReadable(ctx.body)) {
        ctx.body.pipe(ctx.res);
    } else {
        // ctx.res.write(res.body);
        ctx.res.end(ctx.body || '');
    }
};

/** Route middleware.
 * @param {Route} schema - route schema object
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
async function router(schema, ctx, next) {
    if (ctx.req.method === schema.method.toUpperCase()) {
        const {
            path,
            responseSchema,
            handler = new Function(),
        } = schema;
        const urlParts = url.parse(ctx.req.url, true);
        const pathMask = path.replace(/:[a-zA-Z0-9]+/g, '[a-zA-Z0-9_]+');
        if (ctx.req.url === path /*urlParts.pathname.match(new RegExp(pathMask))*/) {
            ctx.req.params = urlParts.query;
            let data = await handler(ctx);
            if (responseSchema) {
                data = JSON.stringify({
                    status: 'ok',
                    data
                });
            }
            // const r = [
            //     {
            //         type: 'object',
            //         properties: {
            //             status: {
            //                 type: 'string',
            //                 default: 'ok'
            //             },
            //             data: {
            //                 type: 'object'
            //             }
            //         }
            //     },
            //     {
            //         type: 'array',
            //         properties: 
            //     }
            // ]
            ctx.body = data;
        }
    }

    await next();
}

/** BodyParser middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
async function bodyParser(ctx, next) {
    if (ctx.req.method === 'GET') {
        await next();
    } else {
        let data = '';
        ctx.req.on('data', function (chunk) {
            data += chunk;
        });
        ctx.req.on('end', async function () {
            ctx.req.body = qs.parse(data);
            await next();
        });
    }
}

/** Timer middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
async function timer(ctx, next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.res.setHeader('X-Response-Time', ms + 'ms');
    ctx.log('Response time:', ms + 'ms');
}

/** Error middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
async function error(ctx, next) {
    try {
        await next()
    } catch (e) {
        ctx.res.statusCode = e.status || 500;
        if (e.message) {
            ctx.body = {
                ok: false,
                message: e.message
            };
        } else {
            ctx.body = 'Internal server error';
        }       
    }
}

module.exports = {
    resolver,
    bodyParser,
    timer,
    error,
    router,
}