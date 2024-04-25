[parsing_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelparse

# Parsing

When the server receives a request, it sets the request body to undefined until no handler can parse it.

```js
server.get('/', function(ctx) {
	// print: undefined
	console.log(ctx.request.body);
})
```

Exactly for parsing purposes application provides a special event called [`kernel.parse`][parsing_event], which fires immediately after `kernel.request`. This is the only place where the request body can be actually changed. During another handlers, the request body will be read-only.

```js
// GET / HTTP/1.1 
// foo

server.post('/', function(ctx) {
	// print: 'foo'
	console.log(ctx.request.body);
})
.on('kernel.parse', async function(event) {
	let data = ''

	for await(let chunk of event.body) {
		data += chunk
	};

	event.body = data; 
});
```

