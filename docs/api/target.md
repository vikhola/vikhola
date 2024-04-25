# Target

Target is a class that implements a publisher-subscriber pattern which helps to create a events from different parts of the application and their listeners which will listen to the raised events.

## Methods

<table>
	<tbody>
		<tr>
			<td>
				<b>on(eventName, listener [, options])</b>
			</td>
		</tr>
		<tr>
			<td>
				The "on()" method adds the listener function to the listeners collection for the event named "eventName". Any given listener could be added only once per event. 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => 
	console.log(event)
);
/**
* print: { name: 'foo' }
*/
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				The "once" option indicate that listener will be executed only once after what it will be removed from the "eventName".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => 
	console.log(event.name), { once: true }
);
/**
* print: foo x1
*/
target.emit({ name: 'foo' });
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				The "priority" is a integer in the range between "0" and "10" that controls the order in which listeners are executed (the higher the number, the earlier a listener is executed). By default equal to "0".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', () => 
	console.log('I am second')
);
target.on('foo', () => 
	console.log('I am first'), { priority: 1 }
);
/**
* print: I am first
* print: I am second
*/
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				The "signal" option accepts an "AbortSignal" which removes the event listener after the "abort" event.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
const controller = new AbortController();
target.on('foo', event => {
	console.log(event.name)
	controller.abort()
}, { signal: controller.signal });
/**
* print: foo x1
*/
target.emit({ name: 'foo' });
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr> 
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>off(eventName, listener)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "off()" method removes the listener function from the listeners collection for the event named "eventName". 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
const listener = event => console.log(event.name);
target.on('foo', listener);
target.off('foo', listener); 
/**
* doesn't print anything
*/
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr> 
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>eventNames()</b> 
			</td>
		</tr>
		<tr>
			<td>
				The "eventNames()" method returns an array of the events with registered listeners. The values in the array are strings or Symbol`s.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => console.log(event));
/**
* print: [ "foo" ]
*/
console.log(target.eventNames());
				</pre>
			</td>
		</tr> 
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>listeners(eventName)</b> 
			</td>
		</tr>
		<tr>
			<td>
				The "listeners()" method returns a copy of the collection of listeners for the event named "eventName".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => console.log(event));
/**
* print: [ [Function (anonymous)] ]
*/
console.log(target.listeners('foo'));
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>rawListeners(eventName)</b> 
			</td>
		</tr>
		<tr>
			<td>
				The "rawListeners()" method returns a collection containing the raw listeners, sorted by their priority, for the event named "eventName". 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => console.log(data), { priority: 1 });
target.on('foo', event => console.log(data), { priority: 2 });
/**
* print: [
*  [Function: bound Listener] {
*    listener: [Function (anonymous)],
*    priority: 2
*  },
*  [Function: bound Listener] {
*    listener: [Function (anonymous)],
*    priority: 1
*  }
* ]
*/
console.log(target.rawListeners('foo'));
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>listenerCount(eventName)</b> 
			</td>
		</tr>
		<tr>
			<td>
				The "listenerCount()" method returns the number of listeners listening for the event named "eventName".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => console.log(event));
/**
* print: 1
*/
console.log(target.listenerCount('foo'));
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>removeAllListeners([eventName])</b>
			</td>
		</tr>
		<tr>
			<td>
				The "removeAllListeners()" removes all listeners, or those of the specified "eventName". 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => console.log(event));
target.on('bar', event => console.log(event));
target.removeAllListeners('foo');
/**
* print: 0
*/
console.log(target.listenerCount('foo'));
/**
* print: 1
*/
console.log(target.listenerCount('bar'));
target.removeAllListeners();
/**
* print: 0
*/
console.log(target.listenerCount('bar'));
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>emit(event)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "emit()" method notify each of registered for the "eventName" listeners in the order of their priority and is some of them is asynchronous awaits for their resolution.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', event => console.log(event.name));
/**
* print: foo
*/
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				Event with only the "name" property will call event listeners in synchronous way, but they will be processed in parallel until the last listener completes its execution.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target
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
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				The "serial" option set to "true" means that event listeners will be triggered sequentially as the next listener waits for the previous one to resolve.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target
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
target.emit({ name: 'foo', serial: true });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				 The "stopped" parameter set to "true" stops current event propagation.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target
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
target.emit({ name: 'foo', serial: true });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				But if the "serial" property is set to "false" or is not defined at all, stopping the event from propagating due to its nature will have the expected effect only in synchronous cases.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target
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
target.emit({ name: 'foo' });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				When the "captureRejection" option set to "true" the event listeners errors will be captured and emitted as "kernel.warning" event.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target
.on('foo', async (event) => {
	await new Promise(resolve => setTimeout(resolve, 3));
	throw new Error('oops')
})
.on('kernel.warning', (event) => {
	console.log(event.error.message);
});
/**
* print: oops
*/
target.emit({ name: 'foo', captureRejection: true });
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				Method returns "true" or promise that resolves "true" depending on whether synchronous or asynchronous listeners are listening to the event, otherwise immediately returning "false" if there are no listeners.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
console.log(target.emit({ name: 'foo' }));

target.on('foo', async data => {});

/**
* true
*/
console.log(await target.emit({ name: 'foo' }));
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				If there is no guarantee which listeners will listen provided event it is recommended to use `async`/`await` in addition to assurance of the listeners successfully execution it also makes listeners error handling is much easier in the case when "captureRejection" is not "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
target.on('foo', async data => {});
target.on('foo', () => new Promise((resolve, reject) => setImmediate(resolve)));
target.on('foo', data => {
	throw new Error('Oops')
});
    
try {
    await target.emit({ name: 'foo' });
} catch(error) {
    // print: 'Error message is "Oops".'
    console.log(`Error message is "${error.message}".`);
}
				</pre>
			</td>
		</tr>
	</tbody>
</table>