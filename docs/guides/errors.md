[tasks]: https://github.com/vikhola/vikhola/blob/main/docs/guides/tasks.md
[error_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelerror
[warning_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelwarning
[critical_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelcritical

# Error Handling

The documentation refers and describes how application handles exceptions.

## Listeners Errors

When an error occurs during event propagation, the target where was emitted event will throw or reject error which depends whether synchronous or asynchronous listeners was triggered.

```js
target.on('foo', data => {
	throw new Error('Oops');
});
    
try {
    target.emit({ name: 'foo' });
} catch(error) {
    // print: 'Error message is "Oops".'
    console.log(`Error message is "Oops".`);
}
```

If there is no guarantee which listeners will listen to the provided event and ensure that exception handles properly, it is recommended to use `async`/`await` keyword.

```js
target
.on('foo', data => {
	return Promise.resolve();
})
.on('foo', data => {
	throw new Error('Oops');
});
    
try {
    await target.emit({ name: 'foo' });
} catch(error) {
    // print: 'Error message is "Oops".'
    console.log(`Error message is "Oops".`);
}
```

## Lifecycle Errors 

When a controller or event listener throws unhandled error before sending a response, this exception is handled at the application error level. This layer has a default error handler that will handle the response based on the incoming exception. By default handler process exception as the Internal Server Error.

```js
server.get('/', function() { 
	throw new Error('Oops');
})
.on('kernel.finish', function(event) {
	// print: 500 Internal Server Error
	console.log(event.response.statusCode, event.response.body);
});
``` 

Exceptions can define a `status` and a `content` props that will be assigned to the response by the error handler. The status property specifies the `statusCode` of the response.

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

The warning level handle errors from events where  `captureRejection` property set to `true`, mostly its a [tasks] as `kernel.finish`, and its provides [`kernel.warning`][warning_event] for this purpose. This level, unlike `kernel.error`, does not have any default handler and could be useful mostly for logging.

```js
server
.on('kernel.finish', function(event) { 
	throw new Error('Oops');
})
.on('kernel.warning', function(event) {
	// print: Oops
	console.log(event.error.message);
});
``` 

## Critical

The critical level handles exceptions that occurs during previous error levels or during response writing. This level provides its own event, [`kernel.critical`][critical_event], which as `kernel.warning` can be useful for logging.

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