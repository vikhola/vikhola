[lifecycle]: https://github.com/vikhola/vikhola/blob/main/docs/guides/lifecycle.md

## Built-in Event

Built-in events are triggered by the application at different stages of the request [lifecycle][lifecycle]. 

## kernel.request

This is first event in the lifecycle and executes very early and regardless of if route has handler or not. Purpose of this event is to send response immediately, or to add information to the Request (e.g. setting the locale or setting some other information on the Request attributes).

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.request
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped.
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.request
			</td>
			<td> 
				The "request" property return reference to the current application request.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.response
			</td>
			<td> 
				The "response" property return reference to the current application response.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.parse

Triggers right after `kernel.request` if route has handler. The purpose of this event is to allow the request body to be parsed and set before the following events and controller.

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.parse
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.body
			</td>
			<td> 
				The "body" property return a request body that needs to be parsed.
			</td>
			<td>
				<pre> 
/**
* print: IncomingMessage {
*  _readableState: ReadableState {
*  ...
* } 
*/
event.body 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.headers
			</td>
			<td> 
				The "headers" property return a request headers.
			</td>
			<td>
				<pre> 
/**
* print: HttpHeaders {
*  ...
* }
*/
event.headers
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.controller

Executes after the `kernel.parse` and only if route has its own handler. Listeners to this event might initialize some part of the system that needs to be initialized after certain things have been determined but before the controller is executed.

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.controller
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped.
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.request
			</td>
			<td> 
				The "request" property return reference to the current application request.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.response
			</td>
			<td> 
				The "response" property return reference to the current application response.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.response

Executes right before the response writing, when controller has been executed or when previous levels was interrupted by response `send()` method. Could be useful to modify the response before sending it back (e.g. add/modify HTTP headers, add cookies, etc.).

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.response
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped.
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.request
			</td>
			<td> 
				The "request" property return reference to the current application request.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.response
			</td>
			<td> 
				The "response" property return reference to the current application response.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.error

The event is triggered when the controller or one of the event handlers throws an error. This event allows to create an appropriate return response for the exception.

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.error
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped.
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.error
			</td>
			<td> 
				The "error" property returns a reference to the error that caused the event to trigger.
			</td>
			<td>
				<pre> 
/**
* print: Error {
*  ...
* }
*/
console.log(event.error); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.request
			</td>
			<td> 
				The "request" property return reference to the current application request.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.response
			</td>
			<td> 
				The "response" property return reference to the current application response.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.serialize

Triggers only when response has type that cannot be sent to the client side. The purpose of this event is to allow the response body to be serialized by a custom serializer before actually writing the response.

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.serialize
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.body
			</td>
			<td> 
				The "body" property return a response body that needs to be serialized.
			</td>
			<td>
				<pre> 
/**
* print: { foo: 'bar' }
*/
event.body 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.headers
			</td>
			<td> 
				The "headers" property return a response headers.
			</td>
			<td>
				<pre> 
/**
* print: HttpHeaders {
*  ...
* }
*/
event.headers
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.trailers

Triggers only if the response contains at least one trailer and only after the response header and body have been sent. The purpose of this event is to set the values of the corresponding trailers.

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.trailers
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.body
			</td>
			<td> 
				The "body" property return a response body.
			</td>
			<td>
				<pre> 
/**
* print: 'foo'
*/
event.body 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.headers
			</td>
			<td> 
				The "headers" property return a response headers.
			</td>
			<td>
				<pre> 
/**
* print: HttpHeaders {
*  ...
* }
*/
event.headers
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.trailers
			</td>
			<td> 
				The "trailers" property return a response trailers.
			</td>
			<td>
				<pre> 
/**
* print: {
*  foo: undefined
* }
*/
event.headers
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.warning

Triggers when an Error occurs during response writing and when response has been sent. Since this event is dispatched when a response has already been sent, it is primarily for informational purposes.

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.warning
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.error
			</td>
			<td> 
				The "error" property returns a reference to the error that caused the event to trigger.
			</td>
			<td>
				<pre> 
/**
* print: Error {
*  ...
* }
*/
console.log(event.error); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.request
			</td>
			<td> 
				The "request" property return reference to the current application request.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.response
			</td>
			<td> 
				The "response" property return reference to the current application response.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.finish

Sent after sending a reply. Allows to perform certain actions that may have been delayed in order to get back to the client as quickly as possible (such as sending emails).

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.finish
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.request
			</td>
			<td> 
				The "request" property return reference to the current application request.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.response
			</td>
			<td> 
				The "response" property return reference to the current application response.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.critical

Triggered when an error occurs during "kernel.finish" or previous error handlers. This is the last error event, so it serves no other purpose than informational purposes.

### Properties

<table>
	<tbody>
		<tr>
			<th>Property </th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td>
				event.name
			</td>
			<td> 
				The "name" property returns current event name.
			</td>
			<td>
				<pre> 
/**
* print: kernel.critical
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.serial
			</td>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
			<td>
				<pre> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.target
			</td>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
			<td>
				<pre> 
/**
* print: EventTarget {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.stopped
			</td>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
			<td>
				<pre> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.error
			</td>
			<td> 
				The "error" property returns a reference to the error that caused the event to trigger.
			</td>
			<td>
				<pre> 
/**
* print: Error {
*  ...
* }
*/
console.log(event.error); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.request
			</td>
			<td> 
				The "request" property return reference to the current application request.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				event.response
			</td>
			<td> 
				The "response" property return reference to the current application response.
			</td>
			<td>
				<pre> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>