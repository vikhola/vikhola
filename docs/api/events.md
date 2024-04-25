[lifecycle]: https://github.com/vikhola/vikhola/blob/main/docs/guides/lifecycle.md

## Built-in Event

Built-in events are triggered by the application at different stages of the request [lifecycle][lifecycle]. 

## kernel.request

This is first event in the lifecycle and executes very early and regardless of if route has handler or not. Purpose of this event is to send response immediately, or to add information to the request (e.g. setting the locale or setting some other information on the Request attributes).

### Properties

<table>
	<tbody>
		<tr>
			<td>
				<b>name</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: kernel.request
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "stopped" property indicates if event propagation was stopped.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target);
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>features</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "features" property return reference to the current context features.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpFeatures {
*  ...
* }
*/
console.log(event.features); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>request</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "request" property return reference to the current context request.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>response</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "response" property return reference to the current context response.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
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
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.parse
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>request</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "request" property return reference to the current context request.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>body</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "body" property get and sets current request body.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* undefined
*/
event.body 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.controller

Executes after the `kernel.parse` and only if route has its own handler. Listeners of this event might initialize some part of the system that needs to be initialized right before the controller is executed.

### Properties

<table>
	<tbody>
		<tr>
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.controller
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "stopped" property indicates if event propagation was stopped.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target);
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>features</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "features" property return reference to the current context features.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpFeatures {
*  ...
* }
*/
console.log(event.features); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>request</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "request" property return reference to the current context request.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>response</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "response" property return reference to the current context response.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
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

Executes right before the response writing, when controller has been executed or when previous events was interrupted by response `send()` method. Could be useful to modify the response before sending it back (e.g. add/modify HTTP headers, add cookies, etc.).

### Properties

<table>
	<tbody>
		<tr>
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.response
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "stopped" property indicates if event propagation was stopped.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target);
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>features</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "features" property return reference to the current context features.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpFeatures {
*  ...
* }
*/
console.log(event.features); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>request</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "request" property return reference to the current context request.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>response</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "response" property return reference to the current context response.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
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

The event is triggered when the controller or one of the event handlers throws an error. This event allows to create an appropriate response to the exception.

### Properties

<table>
	<tbody>
		<tr>
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.error
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "stopped" property indicates if event propagation was stopped.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target);
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>features</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "features" property return reference to the current context features.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpFeatures {
*  ...
* }
*/
console.log(event.features); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>error</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "error" property returns a reference to the error that caused the event to trigger.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: Error {
*  ...
* }
*/
console.log(event.error); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>request</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "request" property return reference to the current context request.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>response</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "response" property return reference to the current context response.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
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

Triggers only when response has body that cannot be sent to the client side. The purpose of this event is to allow the response body to be serialized by a custom serializer before actually writing the response.

### Properties

<table>
	<tbody>
		<tr>
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.serialize
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "stopped" property indicates if event propagation was stopped.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target);
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>response</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "response" property return reference to the current context response.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpResponse {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>body</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "body" property get and sets serialized response body.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: { foo: 'bar' }
*/
event.body 
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
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.trailers
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "stopped" property indicates if event propagation was stopped.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target);
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>response</b>
			</td>			
		</tr>
		<tr>
			<td>
				The "response" property return reference to the current context response.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: HttpResponse {
*  ...
* }
*/
console.log(event.response); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>trailers</b>
			</td>
		</td>
		<tr>
			<td> 
				The "trailers" property returns response trailers that will be sent to the client side.
			</td>
		</td>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: {
*  foo: undefined
* }
*/
event.trailers
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
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.finish
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>captureRejection</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "captureRejection" property indicates whether event listeners exceptions should be caught. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: true
*/
console.log(event.captureRejection); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: Emitter {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>features</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "features" property return reference to the current context features.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: HttpFeatures {
*  ...
* }
*/
console.log(event.features); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>request</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "request" property return reference to the current context request.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: HttpRequest {
*  ...
* }
*/
console.log(event.request); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>response</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "response" property return reference to the current context response.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
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

## kernel.warning

Triggers when an error occurs during event with the `captureRejection` property set to `true`, it has primarily informational purposes.

### Properties

<table>
	<tbody>
		<tr>
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.warning
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>error</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "error" property returns a reference to the error that caused the event to trigger.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: Error {
*  ...
* }
*/
console.log(event.error); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## kernel.critical

Triggered when an error occurs during response writing or error events as `kernel.error` or `kernel.warning`. This is the last error event, so it serves no other purpose than informational purposes.

### Properties

<table>
	<tbody>
		<tr>
			<td>
				<b>name</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "name" property returns current event name.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: kernel.critical
*/
console.log(event.name); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>serial</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "serial" property indicates if event should be executed sequentially. Default "true".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: true
*/
console.log(event.serial); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>stopped</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "stopped" property indicates if event propagation was stopped. This event cannot be stopped so returned value is always "false".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: false
*/
console.log(event.stopped); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>target</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "target" property return a reference to the emitter onto which the event was dispatched.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: KernelEmitter {
*  ...
* }
*/
console.log(event.target); 
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>error</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "error" property returns a reference to the error that caused the event to trigger.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
/**
* print: Error {
*  ...
* }
*/
console.log(event.error); 
				</pre>
			</td>
		</tr>
	</tbody>
</table>