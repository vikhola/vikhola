# Target

Target is a class that helps us create a publisher-subscriber pattern and create a new event from a different part of an application, and a listener will listen to the raised event and have some action performed for the event.

## Methods

<table>
	<tbody>
		<tr>
			<th>Method</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td rowspan=4>
				target.on(eventName, listener [, options])
			</td>
			<td>
				The "on()" method adds the listener function to the listeners collection for the event named "eventName". Any given listener could be added only once per event. Returns a reference to the target, so that calls can be chained.
			</td>
			<td>
				<pre>
server.on('foo', event => 
	console.log(event)
);
/**
* print: { name: 'foo' }
*/
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				The "once" option indicate that listener will be executed only once after what it will be removed from the "eventName".
			</td>
			<td>
				<pre>
server.on('foo', event => 
	console.log(event.name), { once: true }
);
/**
* print: foo x1
*/
server.emit({ name: 'foo' });
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				The "priority" is a integer by default in the range between "0" and "10" that controls the order in which listeners are executed (the higher the number, the earlier a listener is executed). By default equal to "0".
			</td>
			<td>
				<pre>
server.on('foo', () => 
	console.log('I am second')
);
server.on('foo', () => 
	console.log('I am first'), { priority: 1 }
);
/**
* print: I am first
* print: I am second
*/
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				The "signal" option accepts an "AbortSignal" which removes the event listener after the "abort" event.
			</td>
			<td>
				<pre>
const controller = new AbortController();
server.on('foo', event => {
	console.log(event.name)
	controller.abort()
}, { signal: controller.signal });
/**
* print: foo x1
*/
server.emit({ name: 'foo' });
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr> 
		<tr>
			<td>
				target.off(eventName, listener)
			</td>
			<td>
				The "off()" method removes the listener function from the listeners collection for the event named "eventName". Returns a reference to the target, so that calls can be chained.
			</td>
			<td>
				<pre>
const listener = event => console.log(event.name);
server.on('foo', listener);
server.off('foo', listener); 
/**
* doesn't print anything
*/
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr> 
		<tr>
			<td rowspan=2>
				target.eventNames() 
			</td>
			<td>
				The "eventNames()" method returns an array of the events with registered listeners. The values in the array are strings or Symbol`s.
			</td>
			<td>
				<pre>
server.on('foo', event => console.log(event));
/**
* print: [ "foo" ]
*/
console.log(server.eventNames());
				</pre>
			</td>
		</tr> 
		<tr>
			<td>
				As is in the case when an target creates a new "eventName" for a listener whose event does not exist, if the last event listener event is removed from the "eventName" collection, it will be removed.
			</td>
			<td>
				<pre>
const listener = event => console.log(event);
server.on('foo', listener);
/**
* print: [ "foo" ]
*/
console.log(server.eventNames());
server.off('foo', listener);
/**
* print: []
*/
console.log(server.eventNames());
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				target.listeners(eventName) 
			</td>
			<td>
				The "listeners()" method returns a copy of the collection of listeners for the event named "eventName".
			</td>
			<td>
				<pre>
server.on('foo', event => console.log(event));
/**
* print: [
*  {
*    listener: [Function (anonymous)],
*    priority: 0
*  }
* ]
*/
console.log(server.listeners('foo'));
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				target.rawListeners(eventName) 
			</td>
			<td>
				The "rawListeners()" method returns a collection containing the raw listeners buckets, sorted by their priority, for the event named "eventName". 
			</td>
			<td>
				<pre>
server.on('foo', event => console.log(data), { priority: 1 });
server.on('foo', event => console.log(data), { priority: 2 });
/**
* print: [
*  Bucket(1) [
*    Listener {
*      [Symbol(kListenerCallback)]: [Function (anonymous)],
*      [Symbol(kListenerCollection)]: [Collection]
*    },
*    priority: 2
*  ],
*  Bucket(1) [
*    Listener {
*      [Symbol(kListenerCallback)]: [Function (anonymous)],
*      [Symbol(kListenerCollection)]: [Collection]
*    },
*    priority: 1
*  ]
* ]
*/
console.log(server.rawListeners('foo'));
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				target.listenerCount(eventName) 
			</td>
			<td>
				The "listenerCount()" method returns the number of listeners listening for the event named "eventName".
			</td>
			<td>
				<pre>
server.on('foo', event => console.log(event));
/**
* print: 1
*/
console.log(server.listenerCount('foo'));
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				target.removeAllListeners([eventName])
			</td>
			<td>
				The "removeAllListeners()" removes all listeners, or those of the specified "eventName". 
			</td>
			<td>
				<pre>
server.on('foo', event => console.log(event));
server.on('bar', event => console.log(event));
server.removeAllListeners('foo');
/**
* print: 0
*/
console.log(server.listenerCount('foo'));
/**
* print: 1
*/
console.log(server.listenerCount('bar'));
server.removeAllListeners();
/**
* print: 0
*/
server.removeAllListeners();
				</pre>
			</td>
		</tr>
		<tr>
			<td rowspan=7>
				target.emit(event)
			</td>
			<td>
				The "emit()" method notify each of registered for the "eventName" listeners in the order of their priority and awaits for their resolution.
			</td>
			<td>
				<pre>
server.on('foo', event => console.log(event.name));
/**
* print: foo
*/
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				Method return promise that resolves "true" if the event had listeners, "false" otherwise
			</td>
			<td>
				<pre>
/**
* print: false
*/
server.emit({ name: 'foo' })
	.then(console.log);
server.on('foo', data => {});
/**
* print: true
*/
server.emit({ name: 'foo' })
	.then(console.log);
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				Event with only the "name" property will call event listeners synchronously way, but they will be processed in parallel until the last listener completes its execution.
			</td>
			<td>
				<pre>
server
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 3));
	console.log('I am second!');
})
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 1));
	console.log('I am first!');
});
/**
* print:
* I am first! 
* I am second!
*/
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				The "serial" option set to "true" means that event listeners will be triggered sequentially as the next listener waits for the previous one to resolve.
			</td>
			<td>
				<pre>
server
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 3));
	console.log('I am first!');
})
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 1));
	console.log('I am second!');
});
/**
* print:
* I am first! 
* I am second!
*/
server.emit({ name: 'foo', serial: true });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				 The "stopped" parameter set to "true"stop event propagation .
			</td>
			<td>
				<pre>
server
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 3));
	event.stopped = true;
	console.log('I am first!');
})
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 1));
	console.log('I am second!');
});
/**
* print: I am first!
*/
server.emit({ name: 'foo', serial: true });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				But if the "serial" property is set to "false" or is not defined at all, stopping the event from propagating due to its nature will have the expected effect only in synchronous cases.
			</td>
			<td>
				<pre>
server
.on('foo', async (event) => {
	event.stopped = true;
	console.log('I am first!');
})
.on('foo', (event) => {
	console.log('I am second!');
});
/**
* print: I am first!
*/
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				Because in asynchronous it can have an unpredictable behaviour.
			</td>
			<td>
				<pre>
server
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 1));
	event.stopped = true;
	console.log('I am first!');
})
.on('foo', async (event) => {
	console.log('Nope, i was first!');
});
/**
* print: 
* Nope, i was first!
* I am first!
*/
server.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>
	</tbody>
</table>