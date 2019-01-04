var url = require('url');
const http = require('http');
const qs = require('querystring');

/** 
 * Class representing a framework.
 * @class F
 */
module.exports = class F {
    /**
     * Create a framework.
     * @param {Options} opts - The options value.
     */
    constructor(opts = {}) {
        /** 
         * @typedef {Object} Options The Options to use in the framework instanse.  
         * @property {number} [port=3003] The server listening port.  
         * @property {string} [domain='localhost'] The server listening domain.
         * @property {boolean} [bodyParser=true] The bodyparser middleware flag.
         * @property {boolean} [timer=false] The timer middleware flag.
         * @property {boolean} [errorHandler=true] The errorHandler middleware flag.
         * @property {Object} responseSchema The api response schema object.
         */
        /**
         * @type {Options} opts
         */
        this.opts = {
            port: 3003,
            domain: 'localhost',
            bodyParser: true,
            timer: false,
            errorHandler: true,
            responseSchema: {},
            ...opts
        };

        /** 
         * @property {middleware[]} middleware The middleware array.
         */
        this.middleware = [];
    }

    /** Description of the middleware
     *  @callback middleware
     *  @param {Ctx} ctx
     *  @param {Function} next next middleware
     *  @returns void
     */
    /**
     * Method of adding middleware.
     * @param {(middleware|middleware[])} fns - single middlleware or array.
     * @returns void
     */
    add(fns) {
        this.middleware = this.middleware.concat(fns);
    }

    /** 
     * @typedef {Object} Ctx The request context object.  
     * @property {Object} req The request object.  
     * @property {Object} res The response object.
     * @property {number} timestamp The request timestamp.
     * @property {Function} log The logger utility method.
     */
    /** 
     * The middleware binding method.
     * @param {Ctx} ctx- request context object.
     * @returns void
     */
    run(ctx) {
        this.middleware.reduceRight(
            function (done, next) {
                // middleware execution scope
                return function () {
                    return next(ctx, done);
                }
            },
            async () => {
                ctx.res.write(ctx.body);
                ctx.res.end();
            }
        )(ctx);
    }

    /**
     * Implementing build-in middleware method.
     * @returns void
     */
    inject() {
        const {
            timer,
            bodyParser,
            errorHandler,
        } = this.opts;

        if (bodyParser) {
            this.middleware.unshift(this.bodyParser);
        }
        if (timer) {
            this.middleware.push(this.timer.bind(this));
        }
        if (errorHandler) {
            this.middleware.push(this.errorHandler);
        }
    }

    /** 
     * @typedef {Object} Route The route object. 
     * @property {string} method The request http method.
     * @property {string} url The request endpoint url.
     * @property {Function} handler The request handler.
     */
    /**
     * Routing method.
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
                        ctx.body = JSON.stringify({
                            status: 'ok',
                            data
                        });
                    }
                }
                await next();
            });
        });
    }

    /**
     * Logging method.
     * @param {...*} args
     * @returns void
     */
    static log(...args) {
        const date = new Date();
        const datetime = date.toJSON().slice(0, 10) +
            " " + new Date(date).toString().split(' ')[4];
        console.log(`[[F]ramework at ${datetime}]:`, ...args);
    }

    /**
     * BodyParser middleware.
     * @type {middleware} bodyParser
     * @param {Object} ctx request context object
     * @param {*} next next middleware
     * @returns void
     */
    bodyParser(ctx, next) {
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

    /**
     * Timer middleware.
     * @type {middleware} timer
     * @param {Object} ctx request context object
     * @param {*} next next middleware
     * @returns void
     */
    timer(ctx, next) {
        if (this.opts.timer) {
            const ms = new Date() - ctx.timestamp;
            ctx.res.setHeader('X-Response-Time', ms + 'ms');
            this.constructor.log('Response time:', ms + 'ms');
        }
        next();
    }

    /**
     * Error middleware.
     * @type {middleware} errorHandler
     * @param {Object} ctx request context object
     * @param {*} next next middleware
     * @returns void
     */
    errorHandler(ctx, next) {
        // TODO: errors handler
        next();
    }

    /**
     * Create and start server.
     * @returns void
     */
    async go() {
        let {
            port,
            domain,
            greeting,
        } = this.opts;
        try {
            this.inject();
            greeting = greeting || `Server is running on ${domain}:${port}...`
            await http
                .createServer()
                .on('request', (req, res) => {
                    this.run({
                        req,
                        res,
                        log: this.constructor.log,
                        timestamp: new Date(),
                    });
                })
                .listen(port, domain, this.constructor.log(greeting));
        } catch (err) {
            this.constructor.log(err);
            process.exit(1);
        }
    }
}