const fastify = require('fastify')({
    logger: false
})

fastify
  .addHook('onRequest', (request, reply) => new Promise(resolve => setImmediate(resolve)))
  
  // Declare a route
fastify.get('/', function (request, reply) {
    reply.send({ message: "Hello World!" })
})

  // Run the server!
fastify.listen({ port: 3000 })