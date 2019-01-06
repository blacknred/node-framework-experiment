const url = require('url');
const qs = require('querystring');

/** Description of the ctx
 * @typedef {Object} Ctx- The request context object.  
 * @property {Object} req The request object.  
 * @property {Object} res The response object.
 * @property {number} timestamp The request timestamp.
 * @property {Function} log The logger utility method.
 */

/**
 * The next callback.
 * @callback Next- The next middleware
 * @param {Ctx} ctx
 * @param {Next} next
 */

/** BodyParser middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
function bodyParser(ctx, next) {
    if (ctx.req.method === 'GET') {
        next();
    } else {
        let data = '';
        ctx.req.on('data', function (chunk) {
            data += chunk;
        });
        ctx.req.on('end', function () {
            ctx.req.body = qs.parse(data);
            next();
        });
    }
}

/** Timer middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
function timer(ctx, next) {
    const ms = new Date() - ctx.timestamp;
    ctx.res.setHeader('X-Response-Time', ms + 'ms');
    ctx.log('Response time:', ms + 'ms');
    next();
}

/** Error middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
function errorHandler(ctx, next) {
    // TODO: errors handler
    // ctx.res.statusCode = 404;
    // ctx.res.write('Internal Server Error');
    next();
}

/** Error middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @param {object} schema - route schema object
 * @returns void
 */
async function router(ctx, next, schema) {
    const {
        responseSchema,
        path,
        method = 'GET',
        handler = () => {},
    } = schema;
    if (ctx.req.method === method.toUpperCase()) {
        const urlParts = url.parse(ctx.req.url, true);
        ctx.req.params = urlParts.query;
        const pathMask = path.replace(/:[a-zA-Z0-9]+/g, '[a-zA-Z0-9_]+');

        if (urlParts.pathname.match(new RegExp(pathMask))) {
            // handler is not a middleware
            // it's just a function with the ctx object 
            // that returns data
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



            ctx.res.body = data;
        }
    }
    next();
}

module.exports = {
    bodyParser,
    timer,
    errorHandler,
    router,
}