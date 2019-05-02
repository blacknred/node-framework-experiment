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
            }
        }, finish || new Function())(ctx);
    }

    /** The middleware async exec method.
     * @param {Object} ctx- request context object.
     * @param {Function|undefined} finish- the last middleware.
     * @returns void
     * @private
     */
    async asyncRun(ctx, finish) {
        await this[_QUEUE].reduceRight((nextComposition, fn) => {
            // middleware execution scope
            return async function () {
                nextComposition[_isNEXT] = true;
                await fn(ctx, nextComposition);
            }
        }, finish || new Function())(ctx);
    }
}
