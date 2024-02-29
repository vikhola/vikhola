
[target]: https://github.com/vikhola/vikhola/blob/main/docs/api/target.md

# Server

The server used to configure the HTTP pipeline, and routes. This instance inherits the base [target][target] interface. Listeners added to the server will receive a global scope and can be triggered in any more specific scope as a route etc. But also it have its own parameters and properties.

## Parameters 

The server  accepts an options object which is used to customize the resulting instance.

```
const server = new Server(parameters);
```

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
			<th>Method</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
		<tr>
			<td rowspan=2>
				server.route(method, path, controller)
			</td>
			<td> 
				The "route()" method register controller to provided url path with specific method and return router target.
			</td>
			<td>
				<pre> 
server.route('GET', '/', (request, response) => {});
				</pre>
			</td>
		</tr>
		<tr>
			<td> 
				Method return a target for a route scope. Listeners which was added to it will be executed only on this specific route.
			</td>
			<td>
				<pre> 
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
		<tr>
			<td>
				server.get(path, handler)
			</td>
			<td> 
				The "get()" is shorthand declaration for "route()" with an "GET" HTTP method.
			</td>
			<td>
				<pre> 
server.get('/', () => {})
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				server.head(path, handler)
			</td>
			<td> 
				The "head()" is shorthand declaration for "route()" with an "HEAD" HTTP method.
			</td>
			<td>
				<pre> 
server.head('/', () => {})
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				server.post(path, handler)
			</td>
			<td> 
				The "post()" is shorthand declaration for "route()" with an "POST" HTTP method.
			</td>
			<td>
				<pre> 
server.post('/', () => {})
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				server.put(path, handler)
			</td>
			<td> 
				The "put()" is shorthand declaration for "route()" with an "PUT" HTTP method.
			</td>
			<td>
				<pre> 
server.put('/', () => {})
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				server.delete(path, handler)
			</td>
			<td> 
				The "delete()" is shorthand declaration for "route()" with an "DELETE" HTTP method.
			</td>
			<td>
				<pre> 
server.delete('/', () => {})
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				server.options(path, handler)
			</td>
			<td> 
				The "options()" is shorthand declaration for "route()" with an "OPTIONS" HTTP method.
			</td>
			<td>
				<pre> 
server.options('/', () => {})
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				server.patch(path, handler)
			</td>
			<td> 
				The "patch()" is shorthand declaration for "route()" with an "PATCH" HTTP method.
			</td>
			<td>
				<pre> 
server.patch('/', () => {})
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				server.callback()
			</td>
			<td> 
				Return a callback function suitable for the http.createServer() method to handle a request.
			</td>
			<td>
				<pre> 
http.createServer(server.callback()).listen(3000)
				</pre>
			</td>
		</tr>
	</tbody>
</table>