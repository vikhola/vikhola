[error_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelerror
[warning_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelwarning
[critical_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelcritical

# Error Handling

The application refers and describes how application handles exceptions.

## Errors 

When a controller or event listener throws an error before sending a response, this exception is handled at the error level. This layer has a default error handler that will handle the response based on the incoming exception. By default handler process exception as the Internal Server Error.

```js
server.get('/', function() { 
	throw new Error('Oops');
})
.on('kernel.finish', function(event) {
	// print: 500 Internal Server Error
	console.log(event.response.statusCode, event.response.body);
});
``` 

Exceptions can define a `status` and a `response` props that will be assigned to the response by the error handler. The status property specifies the `statusCode` of the response.

```js
server.get('/', function() { 
	const error = new Error('Oops');
	error.status = 400;
	throw error
})
.on('kernel.finish', function(event) {
	// print: 400
	console.log(event.response.statusCode);
});
``` 

If exception only has `status` property, the response `body` will be set to that status message.  

```js
server.get('/', function() { 
	const error = new Error('Oops');
	error.status = 400;
	throw error
})
.on('kernel.finish', function(event) {
	// print: 400 Bad Request
	console.log(event.response.statusCode, event.response.body);
});
``` 

The `content` property defines the response `body`.

```js
server.get('/', function() { 
	const error = new Error('Oops');
	error.status = 400;
	error.content = { message: 'Something bad happened.' }; 
	throw error
})
.on('kernel.finish', function(event) {
	// print: 400 {"message":"Something bad happened."}
	console.log(event.response.statusCode, event.response.body);
});
``` 

However, in addition to the default error handler at this level, there is another tool for interacting with errors - [`kernel.error`][error_event] event. This event dispatches right after handler and allows, in addition to logging, also changing the response payload.

```js
server.get('/', function() { 
	throw new Error('Oops');
})
.on('kernel.error', function(event) {
	// print: Oops 500 Internal Server Error
	console.log(event.error.message, event.response.statusCode, event.response.body);

	event.response.statusCode = 400;
	event.response.send({ message: 'Something bad happened.' }); 
})
.on('kernel.finish', function(event) {
	// print: 400 {"message":"Something bad happened."}
	console.log(event.response.statusCode, event.response.body);
});
``` 

## Warnings

The warning level handles exceptions raised when during the response writing an error occurred. This level only runs when response has already been sent and does not have any handler that will handle an exception, providing [`kernel.warning`][warning_event] event that could be useful for logging.

```js
server
.on('kernel.request', function(event) { 
	event.response.send(new Readable({ read: _ => { throw new Error('Oops'); } }));
})
.on('kernel.warning', function(event) {
	// print: Oops
	console.log(event.error.message);
});
``` 

## Critical

The critical level handles exceptions that occurs during previous levels or `kernel.finish` event. As with the warning, this level runs after the response has already been sent and provides its own event, [`kernel.critical`][critical_event], which also can be useful for logging.

```js
server
.on('kernel.request', function(event) { 
	throw new Error('Oops');
})
.on('kernel.error', function(event) {
	throw event.error
})
.on('kernel.critical', function(event) {
	// print: Oops
	console.log(event.error.message);
});
``` 

Also this is the last error handler in the application and if any of his listeners throws an error, it will be sent to the Node.js process. 