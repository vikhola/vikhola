[target]: https://github.com/vikhola/vikhola/blob/main/docs/api/target.md

# Server

The server used to configure the HTTP pipeline, and routes. This instance inherits the base [target][target] interface. Listeners added to the server will receive a global scope and can be triggered in any route. But also it have its own parameters and properties.

## Parameters 

This options described in the table below:

| Parameter | Description | Default 
|---|---|---|
`caseSensitive` | When true routes are registered as case-sensitive. That is, /foo is not equal to /Foo. When false then routes are case-insensitive. | `true` 
`allowUnsafeRegex` | Allow unsafe expressions | `false`
`ignoreTrailingSlash` | Allow to both /foo and /foo/ point to the same route. This option applies to all route registrations for the resulting server instance. | `false`
`ignoreDuplicateSlashes` | Remove duplicate slashes from the path. It removes duplicate slashes in the route path and the request URL. This option applies to all route registrations for the resulting server instance. | `false`
`maxParamLength` | Length for parameters in parametric (standard, regex, and multi) routes.  If the maximum length limit is reached, the not found error will be triggered. | `100`

## Methods

<table>
	<tbody>
		<tr>
			<td>
				<b>route(method, path, controller)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "route()" method register controller to provided url path with specific method and return router target.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.route('GET', '/', (ctx) => {});
				</pre>
			</td>
		</tr>
		<tr>
			<td> 
				The controller function receives context with current "target", "features", "request" and "response".
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.route('GET', '/', (ctx) => {
	ctx.response.send('foo');
});
				</pre>
			</td>
		</tr>
		<tr>
			<td> 
				Method return a target for a route scope. Listeners which was added to it will be executed only on this specific route.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
const route = server
.route('GET', '/', () => {})
.on('kernel.request', (event) => {
	console.log(event.request.path);
});
/**
* print: 1
*/
console.log(route.listenerCount('kernel.request'));
/**
* print: 0
*/
console.log(server.listenerCount('kernel.request'));
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>get(path, handler)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "get()" is shorthand declaration for "route()" with an "GET" HTTP method.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.get('/', () => {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>head(path, handler)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "head()" is shorthand declaration for "route()" with an "HEAD" HTTP method.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.head('/', () => {})
				</pre>
			</td>
		</tr>	
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>post(path, handler)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "post()" is shorthand declaration for "route()" with an "POST" HTTP method.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.post('/', () => {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>put(path, handler)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "put()" is shorthand declaration for "route()" with an "PUT" HTTP method.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.put('/', () => {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>delete(path, handler)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "delete()" is shorthand declaration for "route()" with an "DELETE" HTTP method.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.delete('/', () => {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>options(path, handler)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "options()" is shorthand declaration for "route()" with an "OPTIONS" HTTP method.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.options('/', () => {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>patch(path, handler)</b>
			</td>
		</tr>
		<tr>
			<td> 
				The "patch()" is shorthand declaration for "route()" with an "PATCH" HTTP method.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
server.patch('/', () => {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>callback()</b>
			</td>
		</tr>
		<tr>
			<td> 
				Return a callback function suitable for the http.createServer() method to handle a request.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'> 
http.createServer(server.callback()).listen(3000)
				</pre>
			</td>
		</tr>
	</tbody>
</table>