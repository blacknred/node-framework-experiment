var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const url = require('url');
const qs = require('querystring');
const { isReadable } = require('./helpers');
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
function resolver(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.res.statusCode = 200;
        yield next();
        if (isReadable(ctx.body)) {
            ctx.body.pipe(ctx.res);
        }
        else {
            // ctx.res.write(res.body);
            ctx.res.end(ctx.body || '');
        }
    });
}
;
/** Route middleware.
 * @param {Route} schema - route schema object
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
function router(schema, ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.req.method === schema.method.toUpperCase()) {
            const { path, responseSchema, handler = new Function(), } = schema;
            const urlParts = url.parse(ctx.req.url, true);
            const pathMask = path.replace(/:[a-zA-Z0-9]+/g, '[a-zA-Z0-9_]+');
            if (ctx.req.url === path /*urlParts.pathname.match(new RegExp(pathMask))*/) {
                ctx.req.params = urlParts.query;
                let data = yield handler(ctx);
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
        yield next();
    });
}
/** BodyParser middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
function bodyParser(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.req.method === 'GET') {
            yield next();
        }
        else {
            let data = '';
            ctx.req.on('data', function (chunk) {
                data += chunk;
            });
            ctx.req.on('end', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    ctx.req.body = qs.parse(data);
                    yield next();
                });
            });
        }
    });
}
/** Timer middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
function timer(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        yield next();
        const ms = Date.now() - start;
        ctx.res.setHeader('X-Response-Time', ms + 'ms');
        ctx.log('Response time:', ms + 'ms');
    });
}
/** Error middleware.
 * @param {Ctx} ctx
 * @param {Next} next
 * @returns void
 */
function error(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield next();
        }
        catch (e) {
            ctx.res.statusCode = e.status || 500;
            if (e.message) {
                ctx.body = {
                    ok: false,
                    message: e.message
                };
            }
            else {
                ctx.body = 'Internal server error';
            }
        }
    });
}
module.exports = {
    resolver,
    bodyParser,
    timer,
    error,
    router,
};
//# sourceMappingURL=middleware.js.map