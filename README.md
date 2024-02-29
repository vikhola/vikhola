<div align="center"><img src="https://raw.githubusercontent.com/vikhola/graphics/9dcfa63177e8b5a505026f7315e563a161e824dc/snowflake_banner.svg"/></div>

# About

Vikhola offers an event-driven framework for HTTP applications with high performance and scalability. 

# Why?

Events offer many benefits, one of which is that they allow you to create objects with a known API that will be sent to listeners who subscribe to them. This helps to have confidence in the data during processes, which is especially important for a weakly and dynamically typed language as javascript.

Listeners, in turn, become independent services that, in addition to improving testability because of well-known API, are also easily replaceable, even if they depend on each other in the context of a subscribed event and represent a complete action.

In complex this is allow to achieve high levels of performance, scalability, consistency and testing in application development.

# Installation

```sh
$ npm i vikhola
```

# Quick start

Package could be required as ES6 module 

```js
import { EventEmitter } from 'vikhola';
```

Or as commonJS module.

```js
const { EventEmitter } = require('vikhola');
```

## First Server

The application starts by creating a server and the first route with a controller bound to it.

```js
// Require the framework and instantiate it
const { Server } = require('vikhola');
const server = new Server();

// Declare a route
server.get('/', function (request, response) {
	response.send({ message: 'Hello World!' });
});

// Run the server!
server.listen(3000);
```

Or with async-await controller:

```js
const { Server } = require('vikhola');
const server = new Server();

server.get('/', async function (request, response) {
	// some async logic
	response.send({ message: 'Hello World!' });
});

// Run the server!
server.listen(3000);
```

## First Events

But what if there is situation wheres need to execute some code before or after controller call? Because this framework does not have middlewares, this kind of work handle events. Events could offer both hight level of flexablility and consistency.

```js 
const { Server } = require('vikhola');

const server = new Server();

// Declare a listeners
server
.on('kernel.request', function(event) {
    console.log('executes before controller.');
})
.on('kernel.response', function(event) {
    console.log('executes after controller.');
});

server.get('/', function (request, response) {
    console.log('controller.');
});

server.listen(3000);
```

## Event Scopes

Now listeners can be executed on each request event. But what to do if listeners should be executed only on particular route. In this case routes also accepts listeners.

```js
const { Server } = require('vikhola');

const server = new Server();

// Declare a route listeners 
server.get('/foo', function (request, response) {
    console.log('controller.');
})
.on('kernel.request', function(event) {
    console.log('executes before controller.');
})
.on('kernel.response', function(event) {
    console.log('executes after controller.');
});

server.get('/bar', function (context) {
    console.log('controller.');
});

server.listen(3000);
```

## Event Priorities

Except of scopes every event could be also organized by his priority (the higher the number, the earlier a listener is executed). By default equal to `0`.

```js
const { Server } = require('vikhola');

const server = new Server();

// Declare a route listeners 
server.get('/', function (request, response) {
    console.log('controller.');
})
.on('kernel.request', function(event) {
    console.log('executed secondary.');
})
.on('kernel.request', function(event) {
    console.log('executed first.');
}, { priority: 10 });

server.listen(3000);
```

## Documentation

This is only a piece of functionality which provides vikhola framework to learn more you can follow documentation:

 - [Usage Guides](https://github.com/vikhola/vikhola/tree/main/docs/guides)
 - [API documentation](https://github.com/vikhola/vikhola/tree/main/docs/api)

## License

[MIT](https://github.com/vikhola/vikhola/blob/main/LICENSE)