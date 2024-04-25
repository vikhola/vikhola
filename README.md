<div align="center"><img src="https://raw.githubusercontent.com/vikhola/graphics/9dcfa63177e8b5a505026f7315e563a161e824dc/snowflake_banner.svg"/></div>

# About

Vikhola offers an event-driven framework for HTTP applications with high performance and scalability. 

# Why?

Events offer objects with a known API that will be sent to listeners who subscribe to them. Listeners, in turn, become independent services which, in addition to improving testability because of well-known API, are also easily replaceable. This helps to have confidence in the data during processes, which is especially important for a weakly and dynamically typed language as javascript.


# Installation

```sh
$ npm i vikhola
```

# Quick start

Package could be required as ES6 module 

```js
import { Server } from 'vikhola';
```

Or as commonJS module.

```js
const { Server } = require('vikhola');
```

## First Server

The application starts by creating a server instance and adding the first route with a controller bound to it.

```js
// Require the framework and instantiate it
const { Server } = require('vikhola');
const server = new Server();

// Declare a route
server.get('/', function (ctx) {
	ctx.response.send({ message: 'Hello World!' });
});
```

Route controller can be both sync and async.

```js
server.get('/', async function (ctx) {
	// some async logic
	ctx.response.send({ message: 'Hello World!' });
});
```

After the route and its controller declaration first server is ready to go!

```js
// Run the server!
server.listen(3000);
```

## First Events

As mention before the vikhola framework provides its own events that will be emitted at different stages of request lifecycle. This example is uses "kernel.request" event, which will be executed before the controller, and "kernel.response", which will be executed after it.

```js 
// Declare a listeners
server
.on('kernel.request', function(event) {
    console.log('executes before controller.');
})
.on('kernel.response', function(event) {
    console.log('executes after controller.');
});

server.get('/', function (ctx) {
    console.log('controller.');
});

server.listen(3000);
```

Besides of server instance, listeners can listen for events on a specific route. This can be done by adding them to the route instance.

```js
// Declare a global listeners 
server.on('kernel.request', function(event) {
    console.log('executes at every request.');
});

const route = server.get('/foo', function (request, response) {
    console.log('controller.');
});

// Declare a route scope listeners 
route.on('kernel.request', function(event) {
    console.log('executes only at this route request.');
}, { priority: 10 });

server.listen(3000);
```

At this example route scope listener executes before the global listener because of its priority. You can read about events, listeners and their options in the provided documentation.

## Documentation

This is only a piece of functionality which provides vikhola framework to learn more you can follow documentation:

 - [Usage Guides](https://github.com/vikhola/vikhola/tree/main/docs/guides)
 - [API documentation](https://github.com/vikhola/vikhola/tree/main/docs/api)

## License

[MIT](https://github.com/vikhola/vikhola/blob/main/LICENSE)