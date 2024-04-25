[events]: https://github.com/vikhola/vikhola/blob/main/docs/guides/events.md

# Routing 

Routing refers to how an application’s endpoints (URIs) respond to client requests.

## Route methods

A route method is derived from one of the HTTP methods, and is attached to an instance of the server class.

```js
server.route('GET', '/', function() {});
```

Server able to route all HTTP methods defined by http core module. However besides of support server also provides shorhand declaration for some methods: 

<table>
	<tbody>
		<tr>
			<th>Method</th>
			<th>Declaration</th>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>GET</b>
			</td>
			<td>
				<pre lang='js'> 
server.get('/', function() {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>HEAD</b>
			</td>
			<td>
				<pre lang='js'> 
server.head('/', function() {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>POST</b>
			</td>
			<td>
				<pre lang='js'> 
server.post('/', function() {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>PATCH</b>
			</td>
			<td>
				<pre lang='js'> 
server.patch('/', function() {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>PUT</b>
			</td>
			<td>
				<pre lang='js'> 
server.put('/', function() {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>DELETE</b>
			</td>
			<td>
				<pre lang='js'> 
server.delete('/', function() {})
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>OPTIONS</b>
			</td>
			<td>
				<pre lang='js'> 
server.options('/', function() {})
				</pre>
			</td>
		</tr>
	</tbody>
</table>

## Route paths

Route paths, in combination with a request method, define the endpoints at which requests can be made. Route paths can be strings or regular expressions. 

```js
server.route('GET', '/', function() {});
```

Route parameters are named URL segments that are used to capture the values specified at their position in the URL. The captured values are populated in the request `params` object, with the name of the route parameter specified in the path as their respective keys.

```js
server.route('GET', '/:id', function() {});
```

Example of route path based on regular expressions:

```js
server.route('GET', '/:id(\\d+)', function() {});
```

## Route controllers

Last argument is a callback function called when the application receives a request to the specified route (endpoint) and HTTP method. This function receive lifecycle context with `request`, `response`, `target` and `features` objects as arguments.

```js
server.route('GET', '/', function(ctx) {
	ctx.response.send('Hello World!')
});
```

But except arguments controller function also receive current event target as `this`. 

```js
server.route('GET', '/', function(ctx) {
	// Emitter {
	//  _events: Map(1) {
	//    'foo' => Collection {
	//    }
	//  },
	//  ...
	console.log(this);
});
```

## Route events

Route methods return event target instance. The event listeners added to this object will be added to the route scope and executed only on this specific route. Read more about application scopes you can [here][scopes] and about events [here][events].

```js
const route = server.route('GET', '/', function(ctx) {});

route.on('kernel.response', function(event) {
	event.response.send('Hello World!');
})
```