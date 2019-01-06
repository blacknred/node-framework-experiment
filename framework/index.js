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
     * @property {string} path The request endpoint url.
     * @property {function} handler The request handler.
     * @property {function} before The middleware before request handler.
     * @property {function} after The middleware after request handler.
     * @property {object} responseSchema The response api schema.
     */

    /** Routing method.
     * @param {(Route|Route[])} schms - single routing object or array.
     * @returns void
     */
    route(schms) {
        const self = this;
        [].concat(schms).forEach(function (schm) {
            const {
                before,
                after,
                ...rest
            } = schm;
            // TODO: handle before and after middleware
            self.add(function (ctx, next) {
                middleware.router(ctx, next, {
                    responseSchema: self[_OPTS].responseSchema,
                    ...rest,
                });
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
            console.log('\x1b[36m%s\x1b[O', `[[F] at ${datetime}]:`, ...args);
    }

    /** Error handling method.
     * @param {number} statusCode
     * @param {string} message
     * @returns void
     */
    throw (statusCode, message) {
        // TODO: throw
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
                    try {
                        this[_QUEUE].run({
                            req,
                            res,
                            log: this.log,
                            timestamp: new Date(),
                        }, () => {
                            if (res.body) {
                                res.statusCode = 200;
                                res.write(res.body);
                            }
                            res.end();
                        });
                    } catch (err) {
                        this.log(err)
                    }
                })
                .listen(port, domain, this.log(greeting));
        } catch (err) {
            this.log(err);
            process.exit(1);
        }
    }
}