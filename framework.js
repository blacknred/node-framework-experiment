const http = require('http');

module.exports = class Framework {
    constructor(opts = {}) {
        this.opts = {
            port: 3000,
            domain: 'localhost',
            ...opts
        };
        this.middlewares = [];
    }

    async run() {
        const {
            port,
            domain,
            greeting,
        } = this.opts;
        try {
            const server = http.createServer();
            server.listen(
                port,
                domain,
                console.log(greeting || `Server is running on ${domain}:${port}...`)
            );
        } catch (err) {
            console.log(err);
            process.exit(1);
        }
    }
}