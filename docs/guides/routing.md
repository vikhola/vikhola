[scopes]: https://github.com/vikhola/vikhola/blob/main/docs/guides/scopes.md
[events]: https://github.com/vikhola/vikhola/blob/main/docs/guides/events.md
[request]: https://github.com/vikhola/vikhola/blob/main/docs/api/request.md
[response]: https://github.com/vikhola/vikhola/blob/main/docs/api/response.md

# Routing 

Routing refers to how an application’s endpoints (URIs) respond to client requests.

## Route methods

A route method is derived from one of the HTTP methods, and is attached to an instance of the server class.

```js
server.route('GET', '/', function() {});
```

Server able to route all HTTP methods defined by http core module. However besides of support server also provides shorhand declaration for some methods: 

Method | Declaration |
---|---|
`GET` | ```server.get('/', function() {}) ```
`HEAD` | ```server.head('/', function() {})```
`POST` | ```server.post('/', function() {})```
`PATCH` | ```server.patch('/', function() {})```
`PUT` | ```server.put('/', function() {})```
`DELETE` | ```server.delete('/', function() {})```
`OPTIONS` | ```server.options('/', function() {})```


## Route paths

Route paths, in combination with a request method, define the endpoints at which requests can be made. Route paths can be strings or regular expressions. 

```js
server.route('GET', '/', function() {});
```

Route parameters are named URL segments that are used to capture the values specified at their position in the URL. The captured values are populated in the request `params` object, with the name of the route parameter specified in the path as their respective keys.

```js
server.route('GET', '/:id', function() {});
```

Example of route path based on regular expressions:

```js
server.route('GET', '/:id(\\d+)', function() {});
```

## Route controllers

Last argument is a callback function called when the application receives a request to the specified route (endpoint) and HTTP method. This function receive application [`request`][request] and [`response`][response] objects as arguments.

```js
server.route('GET', '/', function(request, response) {
	response.send('Hello World!')
});
```

But except arguments controller function also receive current event target as `this`. 

```js
server.route('GET', '/', function(request, response) {
	// EventTarget {
	//  _events: Map(1) {
	//    'foo' => Collection {
	//      [Symbol(kCollectionListeners)]: [Array],
	//      [Symbol(kCollectionCallbacks)]: [Map]
	//    }
	//  },
	//  ...
	console.log(this);
});
```

## Route events

Route methods return event target instance. The event listeners added to this object will be added to the route scope and executed only on this specific route. Read more about application scopes you can [here][scopes] and about events [here][events].

```js
const route = server.route('GET', '/', function(request, response) {});

route.on('kernel.response', function(event) {
	event.response.send('Hello World!');
})
```