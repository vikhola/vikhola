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
                                 │  kernel.warning ◄───┴───────┐          
                                 │         │                   │          
                                 │         │                   ▼          
                                 ├─◄───────┴───────► ──────kernel.finish  
                                 │                             │          
                                 └──► kernel.critical ◄────────┘          
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
server.get('/', function(request, response) {
	response.send('This message will never be received by the client.'); 	
})
.on('kernel.request', function(event) {
	event.response.send('The client will receive only this message.')
});
``` 

However, if the same method is called during the `kernel.response` or `kernel.error` events, their propagation will stop and the lifecycle will go straight to the write stage.

```js
server.get('/', function(request, response) {})
.on('kernel.response', function(event) {
	event.response.send('The client will receive only this message.')
})
.on('kernel.response', function(event) {
	event.response.send('This message will never be received by the client.') 
});
``` 

After the response send to the client lifecycle cannot be manually interrupted and will change it stage only if error will be throw. 