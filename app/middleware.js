/* middleware */

module.exports = [
    (async (ctx, next) => {
        ctx.log('mddlwr2');
        await next();
    }),
    (async (ctx, next) => {
        setTimeout(async () => {
            ctx.log('mddlwr3');
            await next();
        }, 100)
    })
];
