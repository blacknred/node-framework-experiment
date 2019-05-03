const F = require('../lib/index.es5');

const f:F = new F({
    timer: boolean: true,
});

f.route({
    method: 'GET',
    path: '/p',
    responseSchema: null,
    handler: () => 'Hello from [F]ramework!',
});

f.go()