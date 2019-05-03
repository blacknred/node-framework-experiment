"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const Queue = require('./queue');
const middleware = require('./middleware');
const _OPTS = Symbol('opts');
const _QUEUE = Symbol('queue');
const METHODS = ['get', 'post', 'update', 'delete', 'head'];
/**
 * Class representing a framework.
 * @class
 * @public
 */
class F {
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
        this[_OPTS] = Object.assign({ port: 3000, domain: 'localhost', bodyParser: true, timer: false, errorHandler: true, responseSchema: {} }, opts);
        /**
         * Queue.
         * @type {Queue}
         */
        this[_QUEUE] = new Queue();
        // implement build-in middleware
        this[_QUEUE].add(middleware.resolver);
        if (this[_OPTS].timer) {
            this[_QUEUE].add(middleware.timer);
        }
        if (this[_OPTS].errorHandler) {
            this[_QUEUE].add(middleware.error);
        }
        if (this[_OPTS].bodyParser) {
            this[_QUEUE].add(middleware.bodyParser);
        }
    }
    /** Description of the middleware
     *  @callback middleware
     *  @param {Ctx} ctx- The request context object.
     *  @param {Function} next- The next middleware
     *  @returns void
     */
    /**
     * Method of using middleware.
     * @param {(middleware|middleware[])} fns - single middleware or array.
     * @returns void
     */
    use(...fns) {
        fns.forEach((fn) => {
            if (fn instanceof Array) {
                this.use(...fn);
            }
            if (fn instanceof Function) {
                this[_QUEUE].add(fn);
            }
        });
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
        [].concat(schms).forEach((schm) => {
            if (METHODS.includes(schm.method.toLowerCase()) && schm.path && schm.handler) {
                // TODO: handle before and after middlewares
                this.use((...args) => middleware.router(Object.assign({ responseSchema: this[_OPTS].responseSchema }, schm), ...args));
            }
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
    throw(statusCode, message) {
        // TODO: throw
    }
    /** Create and start server.
     * @returns void
     */
    go() {
        return __awaiter(this, void 0, void 0, function* () {
            let { port, domain, greeting, } = this[_OPTS];
            greeting = greeting || `Server 🚀  on ${domain}:${port}...`;
            try {
                yield http_1.default
                    .createServer()
                    .on('request', (req, res) => {
                    try {
                        this[_QUEUE].asyncRun({
                            req,
                            res,
                            log: this.log,
                        });
                    }
                    catch (err) {
                        this.log(err);
                    }
                })
                    // .on('error', () => {})
                    .listen(port, domain, this.log(greeting));
            }
            catch (err) {
                this.log(err);
                process.exit(1);
            }
        });
    }
}
exports.default = F;
//# sourceMappingURL=index.js.map