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
    next();
}

module.exports = {
    bodyParser,
    timer,
    errorHandler
}