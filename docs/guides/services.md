[scopes]: https://github.com/vikhola/vikhola/blob/main/docs/guides/scopes.md

# Services

Each service provides its own logic for some actions, but in general they are all subscribers to a specific event. In this example, the function behaves like a service.

```js
server.on('foo', (event) => {
	// some logic
});
```

However, rather, some instance of the class will act as a service. In this case, things will be a little more complicated than with the default function. Subscribing to an event can be done in a variety of ways, as in this example it is implemented by wrapping functions and preserving class context.

```js
class Service {

	action(event) {
		// some logic	
	}

	subscribe(target) {
		target.on('foo', event => this.action(event));
	}

}

const service = new Service();

service.subscribe(server);
```

Now the method with logic will be executed every time the server generates an event named “foo”, in addition, this method will have access to the class instance and its fields.

```js
class Service {

	constructor() {
		this.count = 0;
	}

	action(event) {
		this.count++
		// some logic	
	}

	subscribe(target) {
		target.on('foo', event => this.action(event));
	}

}

const service = new Service();

service.subscribe(server);
```

Now every time the method is called, it will increment the instance count field. But what to do if increment every time when application publish event is unwanted? This can be done by subscribing to the event inside the request scope. More about scopes you can read [here][scopes].

```js
class Service {

	constructor() {
		this.count = 0;
	}

	action(event) {
		this.count++
		// some logic	
	}

	subscribe(target) {
		target.on('foo', event => this.action(event));
	}

}

server.on('kernel.request', (event) => {
	const service = new Service();
	service.subscribe(event.target);
});
```

With functions it will look almost the same, except for the function context part where the count property is stored within the scope of the function rather than as an class instance field.

```js
server.on('kernel.request', (event) => {
	let count = 0
	event.target.on('foo', (event) => {
		count+=1;
	});
});
```
 