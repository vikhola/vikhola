[parsing_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelcritical

# Parsing

When the server receives a request, it sets up a request body as the incoming message, which contains the content and from which it can be parsed.

```js
server.get('/', function(request, response) {
	// print: IncomingMessage {
	//  ...
	console.log(request.body);
})
```

Exactly for parsing purposes application provides a special event called [`kernel.parse`][parsing_event], which fires immediately after `kernel.request`. This is the only place where can the request body can be actually changed. During another handlers, the request body will be read-only.

```js
// GET / HTTP/1.1 
// foo

server.get('/', function(request, response) {
	// print: 'foo'
	console.log(request.body);
})
.on('kernel.parse', async function(event) {
	let data = ''

	for await(chunk of event.body) {
		data += chunk
	};

	event.body = data; 
});
```

