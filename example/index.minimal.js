const F = require('../lib').default;

const f = new F({
    timer: true,
});

f.route({
    method: 'GET',
    path: '/',
    responseSchema: null,
    handler: () => 'Hello from [F]ramework!',
});

f.go();

// export {};