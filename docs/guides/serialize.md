[serialization_event]: https://github.com/vikhola/vikhola/blob/main/docs/api/events.md#kernelserialize

# Serialization 

When the response has a body of type other than `string`, `buffer` or `stream` that cannot be send to the client, application start serialization process before actual writing. By default during this process response body converts to the string.

```js
server
.get('/', function() {})
.on('kernel.response', function(event) {
	event.response.send({ message: 'Hello World!' }); 
})
.on('kernel.finish', function(event) {
	// print: string
	console.log(typeof event.response.body);
});
```

However serialization process can be customized by using the [`kernel.serialize`][serialization_event] event that will be triggered if at least one event listeners is subscribed to it. During this event body can be converted in the any other supported type as `string`, `buffer` or even `stream`.

```js
server.on('kernel.serialize', function(event) {
	event.body = JSON.stringify(event.body);
});
```