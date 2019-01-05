const F = require('./framework');

const f = new F();
f.route({
    method: 'GET',
    url: '/',
    schema: null,
    handler: () => 'Hello from [F]ramework!'
});
f.log()
f.go()