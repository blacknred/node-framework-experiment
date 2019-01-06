const F = require('./framework/index.es5');

const f = new F({
    timer: true,
});
// f.add(() => {
//     throw new Error('fff');
// })
f.route({
    method: 'GET',
    path: '/p',
    responseSchema: null,
    handler: () => 'Hello from [F]ramework!',
});
f.go()