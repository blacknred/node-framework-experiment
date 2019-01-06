var http = require('http');

var Queue = require('./queue');
var middleware = require('./middleware');

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
        port: 3004,
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
    function add(fns) {
        var q = queue.queue;
        queue.queue = q.concat(fns)
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
            // schm.before
            // schm.after
            // TODO: handle before and after middleware            
            if (typeof schm.responseSchema === undefined) {
                schm.responseSchema = opts.responseSchema;
            }
            add(function (ctx, next) {
                middleware.router(ctx, next, schm);
            });
        });
    }

    /** Implement build-in middleware.
     * @returns void
     */
    function inject() {

        var q = queue.queue;

        if (opts.bodyParser && middleware.bodyParser) {
            q.unshift(middleware.bodyParser);
        }
        if (opts.timer && middleware.timer) {
            q.push(middleware.timer);
        }
        if (opts.errorHandler && middleware.errorHandler) {
            q.push(middleware.errorHandler);
        }

        queue.queue = q;
    }

    /** Finishing method.
     * @param {object} res - response object.
     * @returns void
     */
    function finish(res) {
        if (res.body) {
            res.statusCode = 200;
            res.write(res.body);
        }
        res.end();
    }

    /** Create and start server.
     * @returns void
     */
    function go() {
        try {
            inject();
            var greeting = opts.greeting ||
                'Server is running on ' + opts.domain + ':' + opts.port + '...';
            http
                .createServer()
                .on('request', function (req, res) {
                    try {
                        queue.run({
                            req,
                            res,
                            log,
                            timestamp: new Date(),
                        }, function () {
                            finish(res)
                        });
                    } catch (err) {
                        log(err)
                    }
                })
                .listen(opts.port, opts.domain, log(greeting));
        } catch (err) {
            log(err);
            process.exit(1);
        }
    }

    return {
        log,
        add,
        route,
        go
    };
}