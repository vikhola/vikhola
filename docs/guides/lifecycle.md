[target]: https://github.com/vikhola/vikhola/blob/main/docs/api/target.md
[features]: https://github.com/vikhola/vikhola/blob/main/docs/api/features.md
[request]: https://github.com/vikhola/vikhola/blob/main/docs/api/request.md
[response]: https://github.com/vikhola/vikhola/blob/main/docs/api/response.md

# Lifecycle

Following the schema of the default internal lifecycle.

On the right branch of every section there is the next phase of the lifecycle, on the left branch there is the corresponding section if the parent throws an error.

```
   routing                                                                
      │                                                                   
      │                                                                   
      ▼                                                                   
kernel.request                                                            
      │                                                                   
      ├─► kernel.parse                                                    
      │         │                                                         
      ▼         ├─► kernel.controller                                     
      │         │         │                                               
      │         ▼         ├─► controller                                  
      │         │         │      │                                        
      │         │         ▼      ├─ ► kernel.response                     
      │         │         │      │         │                              
      │         │         │      ▼         ├─► response writing           
      │         │         │      │         │         ▲ │                  
      │         │         │      │         ▼         │ │                  
      └─────────┴─────────┴──────┴── kernel.error    │ │                  
                                           │         │ │                  
                                 ┌─◄───────┴────────►┘ │                  
                                 │                     │                  
                                 │                     ├─ kernel.serialize
                                 │                     │                  
                                 │                     ├─ kernel.trailers 
                                 │                     │                  
                                 │           ┌─────────┴─────────┐        
                                 │           │                   ▼        
                                 │           │             kernel.finish  
                                 │           │                   │        
                                 │           │                   ▼        
                                 │           │             kernel.warning 
                                 │           ▼                   │        
                                 └───► kernel.critical◄──────────┘        
```

## Lifecycle context

The request lifecycle provides access to several objects that can be accessed from the most application events and controller function it is [request], [response], [target], and [features]. 

The request instance is used to provide information about the incoming HTTP request, and it's initialized when an HTTP request is received by the server. 

```js
// GET / HTTP/1.1

server.get('/', function(ctx) { 
	// print: GET
	console.log(ctx.request.method);
});
``` 
 
The response instance is used to set information on the HTTP response sent back to the client.

```js
server.get('/', function(ctx) { 
	ctx.response.statusCode = 204;
});
``` 

The target instance helps to create a events from different parts of the application and their listeners which will listen to the raised events.

```js
server.get('/', function(ctx) { 
	ctx.target.emit({ name: 'foo', message: 'bar' });
});
``` 

The feature provides access to the collection of features for the current request. This collection can be used by event listeners to modify the collection and add support for additional features. 

```js
server
.on('kernel.controller', function(event) {
	event.features.set('foo', 'bar');
})
.get('/', function(ctx) { 
	// print: bar
	console.log(ctx.features.get('foo'));
});
``` 

## Lifecycle interruption

In some cases, the request lifecycle may be interrupted. This happens if some handler throws an error while processing a request. In this case, this exception will be handled by the error handler that it belongs to.

```js
server.get('/', function() { 
	throw new Error('Oops');
})
.on('kernel.error', function(event) {
	// do some stuff
});
``` 

But the lifecycle can also be interrupted manually using the `send()` response method. This can be done during certain events before the response is actually sent. If the `send()` response method was called before the controller, the current kernel event will stop propagating and move its lifecycle to `kernel.response`.

```js
server.get('/', function(ctx) {
	ctx.response.send('This message will never be received by the client.'); 	
})
.on('kernel.request', function(event) {
	event.response.send('The client will receive only this message.')
});
``` 

However, if the same method is called during the `kernel.response` or `kernel.error` events, their propagation will stop and the lifecycle will go straight to the write stage.

```js
server.get('/', function(ctx) {})
.on('kernel.response', function(event) {
	event.response.send('The client will receive only this message.')
})
.on('kernel.response', function(event) {
	event.response.send('This message will never be received by the client.') 
});
``` 

After the response send to the client lifecycle cannot be manually interrupted and will change it stage only if error will be throw. 

