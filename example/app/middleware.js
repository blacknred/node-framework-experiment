/* middleware */

module.exports = [
    (async (ctx, next) => {
        await next();
        ctx.log('mddlwr2');
    }),
    (async (ctx, next) => {
        ctx.log('mddlwr3');
        await next();
    }),
];
