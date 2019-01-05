const _QUEUE = Symbol('queue');

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

    /** The middleware binding method.
     * @param {Object} ctx- request context object.
     * @param {Function} finish- the last middleware.
     * @returns void
     * @private
     */
    run(ctx, finish) {
        this[_QUEUE].reduceRight((done, next) => {
            // middleware execution scope
            return function () {
                return next(ctx, done);
            }
        }, finish)(ctx);
    }
}