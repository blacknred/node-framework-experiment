const url = require('url');
const http = require('http');

const Queue = require('./queue');
const middleware = require('./middleware');

const _OPTS = Symbol('opts');
const _QUEUE = Symbol('queue');

/** 
 * Class representing a framework.
 * @class
 * @public
 */
module.exports = class F {
    /**
     * Create a framework.
     * @param {Options} opts - The options value.
     */
    constructor(opts = {}) {
        /** 
         * @typedef {Options} Options The Options to use in the framework instanse.  
         * @property {number} [port=3000] The server listening port.  
         * @property {string} [domain='localhost'] The server listening domain.
         * @property {boolean} [bodyParser=true] The bodyparser middleware flag.
         * @property {boolean} [timer=false] The timer middleware flag.
         * @property {boolean} [errorHandler=true] The errorHandler middleware flag.
         * @property {Object} responseSchema The api response schema object.
         */
        /**
         * @type {Options} opts
         * @private
         */
        this[_OPTS] = {
            port: 3000,
            domain: 'localhost',
            bodyParser: true,
            timer: false,
            errorHandler: true,
            responseSchema: {},
            ...opts
        };

        /**
         * Queue.
         * @type {Queue}
         */
        this[_QUEUE] = new Queue();
    }

    /** Description of the middleware
     *  @callback middleware
     *  @param {Ctx} ctx- The request context object.
     *  @param {Function} next- The next middleware
     *  @returns void
     */

    /**
     * Method of adding middleware.
     * @param {(middleware|middleware[])} fns - single middleware or array.
     * @returns void
     */
    add(fns) {
        const queue = this[_QUEUE].queue;
        this[_QUEUE].queue = queue.concat(fns)
    }

    /** 
     * @typedef {Object} Route The route object. 
     * @property {string} method The request http method.
     * @property {string} url The request endpoint url.
     * @property {Function} handler The request handler.
     */

    /** Routing method.
     * @param {(Route|Route[])} rts - single routing object or array.
     * @returns void
     */
    route(rts) {
        [].concat(rts).forEach(({
            method = 'GET',
            url: routeUrl,
            middleware,
            schema,
            handler = () => {}
        }) => {
            this.add(async (ctx, next) => {
                if (ctx.req.method === method.toUpperCase()) {
                    var urlParts = url.parse(ctx.req.url, true);
                    // TODO: reqexp mask?
                    if (urlParts.pathname === routeUrl) {
                        // TODO: process the related middleware
                        const data = await handler(ctx);
                        // TODO: global or specific responseSchema
                        ctx.res.body = JSON.stringify({
                            status: 'ok',
                            data
                        });
                    }
                }
                await next();
            });
        });
    }

    /** Logging method.
     * @param {...*} args
     * @returns void
     */
    log(...args) {
        const date = new Date();
        const datetime = date.toJSON().slice(0, 10) +
            " " + new Date(date).toString().split(' ')[4];
        console.log(`[[F]ramework at ${datetime}]:`, ...args);
    }

    /** Create and start server.
     * @returns void
     */
    async go() {
        let {
            port,
            domain,
            greeting,
            timer,
            bodyParser,
            errorHandler,
        } = this[_OPTS];
        try {
            // implement build-in middleware
            const queue = this[_QUEUE].queue;

            if (bodyParser && middleware.bodyParser) {
                queue.unshift(middleware.bodyParser);
            }
            if (timer && middleware.timer) {
                queue.push(middleware.timer);
            }
            if (errorHandler && middleware.errorHandler) {
                queue.push(middleware.errorHandler);
            }

            this[_QUEUE].queue = queue;

            greeting = greeting || `Server is running on ${domain}:${port}...`
            await http
                .createServer()
                .on('request', (req, res) => {
                    this[_QUEUE].run({
                        req,
                        res,
                        log: this.log,
                        timestamp: new Date(),
                    }, () => {
                        res.write(res.body);
                        res.end();
                    });
                })
                .listen(port, domain, this.log(greeting));
        } catch (err) {
            this.log(err);
            process.exit(1);
        }
    }
}