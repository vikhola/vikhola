# Tasks

In most cases desirable behavior is to wait for an action to resolve before calling the next one. But sometimes there is need to perform certain actions that may have delayed to return the response as quickly as possible to the client (e.g. sending emails). This can be done by tasks, which is the event's with `captureRejection` property set to `true` passed through Node.js event loop.

```js
queueMicrotask(() => target.emit({ name: 'foo', captureRejection: true }))
```

At this example the event will be enqueue and executed after the current task has completed its work and when there is no other code waiting to be run before control of the execution context is returned to the Node.js loop. If some event listener throw an error during event propagation it will be captured and then emitted as part of the `kernel.warning` event.

```js
target.on('foo', (event) => {
	throw new Error('foo');
});

target.on('kernel.warning', (event) => {
	// print: oops
	console.log(event.error.message);
});

queueMicrotask(() => target.emit({ name: 'foo', captureRejection: true }));
```