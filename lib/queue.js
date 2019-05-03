var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const _QUEUE = Symbol('queue');
const _isNEXT = Symbol('isNext');
/** Class representing a middleware queue.
 * @class
 * @public
 */
module.exports = class Queue {
    /** Create a queue. */
    constructor() {
        this[_QUEUE] = [];
    }
    /**
     * @property {Function[]} queue- The middleware array.
     * @private
     */
    get queue() {
        return this[_QUEUE];
    }
    set queue(queue = []) {
        this[_QUEUE] = queue;
    }
    /** The middleware adding method.
     * @param {Function} fn- a middleware.
     * @returns void
     */
    add(fn) {
        this[_QUEUE].push(fn);
    }
    /** The middleware exec method.
     * @param {Object} ctx- request context object.
     * @param {Function|undefined} finish- the last middleware.
     * @returns void
     */
    run(ctx, finish) {
        this[_QUEUE].reduceRight((next, fn) => {
            // middleware execution scope
            return function () {
                return fn(ctx, next);
            };
        }, finish || new Function())(ctx);
    }
    /** The middleware async exec method.
     * @param {Object} ctx- request context object.
     * @param {Function|undefined} finish- the last middleware.
     * @returns void
     * @private
     */
    asyncRun(ctx, finish) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this[_QUEUE].reduceRight((nextComposition, fn) => {
                // middleware execution scope
                return function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        nextComposition[_isNEXT] = true;
                        yield fn(ctx, nextComposition);
                    });
                };
            }, finish || new Function())(ctx);
        });
    }
};
//# sourceMappingURL=queue.js.map