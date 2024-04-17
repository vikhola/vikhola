const { Server } = require('./lib/server')

const server = new Server()

server.on("kernel.request", () => new Promise(resolve => setImmediate(resolve)));
// server.on("kernel.request", (event) => event.target.on('kernel.controller', _ => console.log('fire')));
// server.on('kernel.error', error => console.log(error.error))
// server.route('GET', '/', (request, response) => response.send({ message: "Hello World!" }));
server.route('GET', '/', (ctx) => ctx.response.send({ message: "Hello World!" }));

server.listen(3000)
