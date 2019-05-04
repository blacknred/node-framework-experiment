const _isNEXT: symbol = Symbol('isNext');

/** Class representing a middleware queue.
 * @class
 * @public
 */
export default class Queue {
    /** 
     * @property {Function[]} queue- The middleware array.
     * @private
     */
    private _queue: Function[] = [];
    
    get queue(): Function[] {
        return this._queue;
    }

    set queue(queue: Function[]) {
        this._queue = queue;
    }

    /** The middleware adding method.
     * @param {Function} fn- a middleware.
     * @returns void
     */
    add(fn: Function): void {
        this._queue.push(fn);
    }

    /** The middleware exec method.
     * @param {Object} ctx- request context object.
     * @param {Function|undefined} finish- the last middleware.
     * @returns void
     */
    run(ctx: any, finish: Function | undefined): void {
        this._queue.reduceRight((next: Function, fn: Function) => {
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
    async asyncRun(ctx: any, finish: Function | undefined): Promise<void> {
        await this._queue.reduceRight((nextComposition: any, fn: Function) => {
            // middleware execution scope
            return async function () {
                nextComposition[_isNEXT] = true;
                await fn(ctx, nextComposition);
            }
        }, finish || new Function())(ctx);
    }
}
