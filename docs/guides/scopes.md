# Scopes

Scopes define the context in which event listeners can be accessed.

### Server

Server scope represent a global application context. Every listener bound to an event in this scope will be available everywhere, regardless of where the event was dispatched.

```js 
const route = server.get('/', function() {})

server.on('kernel.request', function (event) {

	// print: [ { listener: [Function: listener], priority: 0 } ]
	console.log(server.listeners('kernel.request'));

	// print: [ { listener: [Function: listener], priority: 0 } ]
	console.log(route.listeners('kernel.request'));

	// print: [ { listener: [Function: listener], priority: 0 } ]
	console.log(event.target.listeners('kernel.request'));
});
```

### Route

Route scope event listeners on other hand executes and can be accessed on only the route and it requests.

```js 
const route = server.get('/', function() {})

route.on('kernel.request', function listener(event) {

	// print: []
	console.log(server.listeners('kernel.request'));

	// print: [ { listener: [Function: listener], priority: 0 } ]
	console.log(route.listeners('kernel.request'));

	// print: [ { listener: [Function: listener], priority: 0 } ]
	console.log(event.target.listeners('kernel.request'));
});
```

### Request

Request scope listeners is quite similar to the route scope but with one difference, listeners bound to the event can be added and accessed only in the context of request.

```js 
const route = server.get('/', function () {});

server.on('kernel.request', function (event) {
	event.target.on('kernel.controller', function listener(event) {});

	// print: []
	console.log(server.listeners('kernel.controller'));

	// print: []
	console.log(route.listeners('kernel.controller'));

	// print: [ { listener: [Function: listener], priority: 0 } ]
	console.log(event.target.listeners('kernel.controller'));
});
```
