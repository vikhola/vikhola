# Events

Here describes event emitting basics.

## Listeners

Event listener is a synchronous or asynchronous function that subscribes to the event with specific name and will be called when event target receive it.

```js 
server.on('foo', function(event) {
	console.log('Hello World!');
});

// print: Hello World!
await server.emit({ name: 'foo' });
```

Every listener could have several options:

### Priorities 

One of them is priority. In most cases listeners will be executed in the order of time when they were added. But it can be changed by defining `priority` option. It is a number in the range between `0` and `10` that controls the order in which listeners are executed (the higher the number, the earlier a listener is executed). By default equal to `0`.

```js 
server
.on('foo', function(event) {
	console.log('I am second!');
})
.on('foo', function(event) {
	console.log('I am first!');
}, { priority: 10 });

// print:
// I am first! 
// I am second!
await server.emit({ name: 'foo' });
```

### Once

Sometimes listener should be called only once, to achieve this behavior enough to set the `once` option to `true` and listener will be executed only once after what it will be removed.

```js
server.on('foo', function(event) {
	console.log('I can be executed only once!');
}, { once: true });

// print: I can be executed only once! x1
await server.emit({ name: 'foo' });
await server.emit({ name: 'foo' });
```

### Signals

But `once` is not the only option that allows to remove a listener without manual intervention. The second possibility is the `signal` option that accepts an `AbortSignal` which removes the event listener after the `abort` event.

```js
const controller = new AbortController();

server.on('foo', function(event) {
	console.log('I can be executed only once!');
}, { signal: controller.signal });

// print: I can be executed only once! x1
await server.emit({ name: 'foo' });
controller.abort()
await server.emit({ name: 'foo' });
``` 

## Dynamic Listeners

Listeners can add another listener to the same event during its propagation, but executed it will be only during the next event call.

```js 
server.on('foo', function(event) {
	server.on('foo', function(event) {
		console.log('Hello World!');
	})
});

// does not print anything
await server.emit({ name: 'foo' });
// print: Hello World!
await server.emit({ name: 'foo' });
```

## Arguments and `this`

As argument event listener will get event that was dispatched and initiate listeners call.

```js 
server.on('foo', function(event) {
	// print: { name: 'foo' }
	console.log(event);
});

await server.emit({ name: 'foo' });
```

But also the listener will receive the event target as "this", which can be very useful, especially when the event doesn't provide the target it was sent from.

```js 
server.on('foo', function(event) {
	// Server {
	//  _events: Map(1) {
	//    'foo' => Collection {
	//      [Symbol(kCollectionListeners)]: [Array],
	//      [Symbol(kCollectionCallbacks)]: [Map]
	//    }
	//  },
	//  ...
	console.log(this);
});

await server.emit({ name: 'foo' });
```

However, during request processing, the listener will in most cases be called on the request event target and receive it as `this`. The only way to change it at runtime is to directly access the desired source.

```js 
server.on('kernel.request', function (event) {
	// Emitter {
	//  _events: Map(1) {
	//    'foo' => Collection {
	//      [Symbol(kCollectionListeners)]: [Array],
	//      [Symbol(kCollectionCallbacks)]: [Map]
	//    }
	//  },
	//  ...
	console.log(this);
});

server.get('/', function () {});
```

## Events

On other side is events. Basically event is just an object containing `name` that identifies it. In this case, the event target will synchronously send the event to listeners and resolve the promise when they have all completed their execution.

```js 
const myEvent = { name: 'foo' };

server.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 1));
	console.log('Hello World!');
});

// print: Hello World!
await server.emit(myEvent);
```

### Sequences

As mention before, a event target that receives an event with only the `name` property will call event listeners synchronously way, but they will be processed in parallel until the last listener completes its execution.

```js 
const myEvent = { name: 'foo' };

server
.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 3));
	console.log('I am second!');
})
.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 1));
	console.log('I am first!');
});

// print:
// I am first! 
// I am second!
await server.emit(myEvent);
```

However, in most situations, sending events sequentially is more preferable. This behavior can be achieved simply by setting the `serial` parameter to `true`, after which each next listener will wait for the previous one to resolve.

```js 
const myEvent = { name: 'foo', serial: true };

server
.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 3));
	console.log('I am first!');
})
.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 1));
	console.log('I am second!');
});

// print:
// I am first! 
// I am second!
await server.emit(myEvent);
```

But what to do if need to completely stop event propagation?

### Stopping

Stopping an event may have differences in behavior between execution sequences, but in any case it occurs by setting the `stopped` parameter to `true`. If event dispatched sequentially, target will simply stop propagation right before next listener call.

```js 
const myEvent = { name: 'foo', serial: true };

server
.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 3));
	event.stopped = true;
	console.log('I am first!');
})
.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 1));
	console.log('I am second!');
});

// print: I am first!
await server.emit(myEvent);
```

But if the `serial` property is set to `false` or is not defined at all, stopping the event from propagating due to its nature will have the expected effect only in synchronous cases.

```js 
const myEvent = { name: 'foo' };

server
.on('foo', async function(event) {
	event.stopped = true;
	console.log('I am first!');
})
.on('foo', function(event) {
	console.log('I am second!');
});

// print: I am first!
await server.emit(myEvent);
```

Because in asynchronous it can have an unexpected effect.

```js 
const myEvent = { name: 'foo' };

server
.on('foo', async function(event) {
	await new Promise(resolve => setTimeout(resolve, 1));
	event.stopped = true;
	console.log('I am first!');
})
.on('foo', async function(event) {
	console.log('Nope, i was first!');
});

// print: 
// Nope, i was first!
// I am first!
await server.emit(myEvent);
```