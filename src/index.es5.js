var http = require('http');

var Queue = require('./queue');
var middleware = require('./middleware');

const METHODS = ['get', 'post', 'update', 'delete', 'head'];

/** 
 * Class representing a framework.
 * @class
 * @public
 */
module.exports = function F(_opts = {}) {
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
     * Create a framework options.
     * @param {Options} opts - The options value.
     */
    var opts = {
        port: 3000,
        domain: 'localhost',
        bodyParser: true,
        timer: false,
        errorHandler: true,
        responseSchema: {},
        ..._opts
    }

    /**
     * Queue.
     * @type {Queue}
     */
    var queue = new Queue();

    /** Logging method.
     * @param {...*} args
     * @returns void
     */
    function log(...args) {
        var date = new Date();
        var datetime = date.toJSON().slice(0, 10) +
            " " + new Date(date).toString().split(' ')[4];
        console.log('\x1b[36m%s\x1b[O', `[[F] at ${datetime}]:`, ...args);
    }

    /** Error handling method.
     * @param {number} statusCode
     * @param {string} message
     * @returns void
     */
    function _throw(statusCode, message) {
        // TODO: throw
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
    function use(fns) {
        fns.forEach((fn) => {
            if (fn instanceof Array) {
                this.use(...fn)
            }
            if (fn instanceof Function) {
                this[_QUEUE].add(fn);
            }
        })
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
    function route(schms) {
        [].concat(schms).forEach(function (schm) {
            if (METHODS.includes(schm.method.toLowerCase()) && schm.path && schm.handler) {
                // TODO: handle before and after middlewares
                use((...args) => middleware.router({
                    responseSchema: opts.responseSchema,
                    ...schm,
                }, ...args));
            }
        });
    }

    /** Implement build-in middleware.
     * @returns void
     */
    function inject() {
        queue.add(middleware.resolver);

        if (opts.timer) {
            queue.add(middleware.timer);
        }

        if (opts.errorHandler) {
            queue.add(middleware.error);
        }

        if (opts.bodyParser) {
            queue.add(middleware.bodyParser);
        }
    }

    /** Create and start server.
     * @returns void
     */
    function go() {
        var greeting = opts.greeting ||
            'Server 🚀  on ' + opts.domain + ':' + opts.port + '...';

        inject();
        http
            .createServer()
            .on('request', function (req, res) {
                queue.asyncRun({
                    req,
                    res,
                    log,
                });
            })
            .on('error', (err) => {
                log(err);
                process.exit(1);
            })
            .listen(opts.port, opts.domain, log(greeting));
    }

    return {
        log,
        add,
        route,
        go
    };
}