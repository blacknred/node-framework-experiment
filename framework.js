const http = require('http');

/** 
 * @typedef {Object} Options The Options to use in the framework instanse.  
 * @property {number} [port=3000] The server listening port.  
 * @property {string} [domain='localhost'] The server listening domain.
 * @property {boolean} [bodyParser=true] The user's age.
 */

 /** 
 * @typedef {Object} Ctx The request context object.  
 * @property {Object} req The request object.  
 * @property {Object} res The response object.
 * @property {number} startTime The request timestamp.
 * @property {Function} log The logger utility method.
 */

/** Description of the middleware
    @callback middleware
    @param {Object} ctx request context object
    @param {*} next next middleware
    @returns void
*/

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
         * @type {Options} opts
         */
        this.opts = {
            port: 3000,
            domain: 'localhost',
            bodyParser: true,
            ...opts
        };

        /** 
         * @property {middleware[]} middlewares The middlewares array.
         */
        this.middlewares = [];

        /** 
         * @property {Function} chaining A method to operate of middlewares.
         * @returns void
         */
        //this.chaining = this.chaining.bind(this);
    }

    /**
     * Add a middleware.
     * @param {(middleware|middleware[])} fns - single middlleware or array.
     * @returns void
     */
    add(fns) {
        this.middlewares = this.middlewares.concat(fns);
    }

    /**
     * Inject the build-in middlewares.
     * @returns void
     */
    inject() {
        const {
            bodyParser,
        } = this.opts;

        // add utilities
        if (bodyParser) {
            this.middlewares.unshift(this.bodyParser);
        }
    }

    /** 
     * A method to operate of middlewares.
     * @param {Ctx} ctx- request context object.
     * @returns void
     */
    chaining(ctx) {
        const done = () => {
            if (this.opts.timer) {
                const ms = new Date() - ctx.startTime;
                ctx.res.setHeader('X-Response-Time', ms + 'ms');
                this.log('Response time:', ms + 'ms');
            }
            ctx.res.write(ctx.body);
            ctx.res.end();
        };
        this.middlewares.reduceRight(function (done, next) {
            // middleware execution scope
            return function () {
                return next(ctx, done);
            }
        }, done)(ctx);
    }

    /**
     * Logger.
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
     * Parse POST body.
     * @type {middleware} bodyParser
     * @param {Object} ctx request context object
     * @param {*} next next middleware
     * @returns void
     */
    bodyParser(ctx, next) {
        //
        next();
    }

    /**
     * Create and start server.
     * @param {(middleware|middleware[])} fns - single middlleware or array.
     * @returns void
     */
    async run() {
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
                this.chaining({
                    req,
                    res,
                    log: this.log,
                    startTime: new Date(),
                });
            })
            server.listen(port, domain, this.log(message));
        } catch (err) {
            this.log(err);
            process.exit(1);
        }
    }
}