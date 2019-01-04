const http = require('http');
const qs = require('querystring');

/** 
 * Class representing a framework.
 * @class Framework
 */
module.exports = class Framework {
    /**
     * Create a framework.
     * @param {Options} opts - The options value.
     */
    constructor(opts = {}) {
        /** 
         * @typedef {Object} Options The Options to use in the framework instanse.  
         * @property {number} [port=3000] The server listening port.  
         * @property {string} [domain='localhost'] The server listening domain.
         * @property {boolean} [bodyParser=true] The user's age.
         */
        /**
         * @type {Options} opts
         */
        this.opts = {
            port: 3000,
            domain: 'localhost',
            bodyParser: true,
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
        const done = () => {
            if (this.opts.timer) {
                const ms = new Date() - ctx.timestamp;
                ctx.res.setHeader('X-Response-Time', ms + 'ms');
                this.log('Response time:', ms + 'ms');
            }
            ctx.res.write(ctx.body);
            ctx.res.end();
        };
        this.middleware.reduceRight(function (done, next) {
            // middleware execution scope
            return function () {
                return next(ctx, done);
            }
        }, done)(ctx);
    }

    /**
     * Implementing build-in middleware method.
     * @returns void
     */
    inject() {
        const {
            bodyParser,
        } = this.opts;

        // add utilities
        if (bodyParser) {
            this.middleware.unshift(this.bodyParser);
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
     * @param {(Route|Route[])} rts - single middleware or array.
     * @returns void
     */
    route(rts) {

    }

    /**
     * Logging method.
     * @param {...*} args
     * @returns void
     */
    log(...args) {
        const date = new Date();
        const datetime = date.toJSON().slice(0, 10) +
            " " + new Date(date).toString().split(' ')[4];
        console.log(`[Framework at ${datetime}]:`, ...args);
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
        }
        let data = '';
        ctx.req.on('data', function (chunk) {
            data += chunk;
        });
        ctx.req.on('end', function () {
            ctx.req.body = qs.parse(data);
            next();
        });
    }

    /**
     * Create and start server.
     * @param {(middleware|middleware[])} fns - single middlleware or array.
     * @returns void
     */
    async go() {
        const {
            port,
            domain,
            greeting,
        } = this.opts;
        try {
            const server = http.createServer();
            const message = greeting || `Server is running on ${domain}:${port}...`
            await this.inject();
            server.on('request', (req, res) => {
                this.run({
                    req,
                    res,
                    log: this.log,
                    timestamp: new Date(),
                });
            })
            server.listen(port, domain, this.log(message));
        } catch (err) {
            this.log(err);
            process.exit(1);
        }
    }
}