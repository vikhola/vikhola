const assert = require("node:assert");
const router = require('find-my-way')
const { describe, it } = require('node:test');
const { PassThrough, Readable } = require("stream");
const { IncomingMessage, ServerResponse } = require("http");
const { STATUS_CODES } = require("node:http");
const { Kernel } = require('../lib/kernel.js')
const { EventTarget }  = require("../lib/target.js");
const { HttpRequest } = require("../lib/request.js");
const { HttpResponse } = require("../lib/response.js");
const {
    kRequestEvent, 
    kParseEvent, 
    kControllerEvent, 
    kResponseEvent, 
    kErrorEvent,
    kSerializeEvent, 
    kWarningEvent, 
    kFinishEvent, 
    kCriticalEvent 
}  = require('../lib/const');
const { 
    RequestEvent, 
    ResponseEvent, 
    ControllerEvent, 
    FinishEvent, 
    CriticalEvent, 
    WarningEvent,
    ErrorEvent, 
    ParseEvent,
    SerializationEvent,
} = require("../lib/events.js");

class RequestMock extends IncomingMessage {

    constructor(url = '/', method = 'GET') {
        super(new PassThrough())
        this.url = url
        this.method = method
    }

}

class ResponseMock extends ServerResponse {

    constructor(request = { method: 'GET'}) {
        super(request)
    }

}

describe('Kernel test', function() {

    describe('"route()" method' , function() {

        it('should add route to the router', async function(t) {
            const aHandler = t.mock.fn()
            const aRouter = router()
            const aKernel = new Kernel(aRouter)

            aKernel.route('GET', '/', aHandler)
            
            assert.deepStrictEqual(aRouter.findRoute('GET', '/'), { handler: aHandler, store: undefined, params: [] })
        })

        it('should return instance of EventTarget', async function(t) {
            const aKernel = new Kernel(router())

            const aRoute = aKernel.route('GET', '/', t.mock.fn())
            assert.strictEqual(aRoute instanceof EventTarget, true)
        })

        it('should return instance of EventTarget', async function(t) {
            const aKernel = new Kernel(router())

            const aRoute = aKernel.route('GET', '/', t.mock.fn())
            assert.strictEqual(aRoute instanceof EventTarget, true)
        })

    })

    describe('"callback()" method', async function() {

        it('should execute global and local event listeners', async function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)
            
            const aErrorListener = t.mock.fn()
            const aGlobalListener = t.mock.fn()
            const aRouteListener = t.mock.fn()

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .on(kRequestEvent, aGlobalListener)
                .route('GET', '/', t.mock.fn())
                .on(kRequestEvent, aRouteListener)

            await aKernel.callback()(aRequest, aResponse) 
        
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
            assert.strictEqual(aRouteListener.mock.callCount(), 1)
            assert.strictEqual(aGlobalListener.mock.callCount(), 1)
        })

        describe('"kernel.request" event', async function() {

            it('should emit the at the start of pipeline', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn()
                const aRequestListener = t.mock.fn(event => assert.strictEqual(event instanceof RequestEvent, true))
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kRequestEvent, aRequestListener)
                    .route('GET', '/', t.mock.fn())
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
            })
    
            it('should stop the request process after response "send()" method', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aHandler = t.mock.fn()
                const aErrorListener = t.mock.fn()
                const aControllerListener = t.mock.fn()
                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kRequestEvent, aFirstListener)
                    .on(kRequestEvent, aSecondListener)
                    .on(kControllerEvent, aControllerListener)
                    .route('GET', '/', aHandler)
    
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aHandler.mock.callCount(), 0)
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aControllerListener.mock.callCount(), 0)
                assert.strictEqual(aFirstListener.mock.callCount(), 1)
                assert.strictEqual(aSecondListener.mock.callCount(), 0)
            })
    
        })

        it('should throw an Error when handler is not defined', async function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aCriticalListener = t.mock.fn()
            const aErrorListener = t.mock.fn(event => {
                assert.strictEqual(event.error.message, 'Route not found.')
                assert.strictEqual(event.error.status, 404)
                assert.strictEqual(event.error.response, STATUS_CODES[404])
            })

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aCriticalListener)
                .route('GET', '/foo', t.mock.fn())
    
            await aKernel.callback()(aRequest, aResponse) 

            assert.strictEqual(aErrorListener.mock.callCount(), 1)
        })    

        it('should not throw an Error when handler is not defined but pipeline was stopped', async function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn()
            const aRequestListener = t.mock.fn(event => {
                event.response.send()
            })

            aKernel
                .on(kRequestEvent, aRequestListener)
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .route('GET', '/foo', t.mock.fn())
    
            await aKernel.callback()(aRequest, aResponse) 

            assert.strictEqual(aRequestListener.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })    

        describe('"kernel.parse" event', async function() {

            it('should emit the event after "kernel.request"', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn()
                const aParseListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ParseEvent, true)
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kParseEvent, aParseListener)
                    .route('GET', '/', t.mock.fn())
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aParseListener.mock.callCount(), 1)
            })

            it('should set raw request as default body', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn()
                const aParseListener = t.mock.fn(event => 
                    assert.strictEqual(event.body, aRequest)
                )
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kParseEvent, aParseListener)
                    .route('GET', '/', t.mock.fn())
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aParseListener.mock.callCount(), 1)
            })

            it('should set request body', async function(t) {
                const expected = 'foo'
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn()
                const aParseListener = t.mock.fn(event => {
                    event.body = expected
                })
                const aHandler = t.mock.fn((request) => {
                    assert.strictEqual(request.body, expected)
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kParseEvent, aParseListener)
                    .route('GET', '/', aHandler)
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aParseListener.mock.callCount(), 1)
                assert.strictEqual(aHandler.mock.callCount(), 1)
            })
    
        })

        describe('"kernel.controller" event', async function() {

            it('should emit the event after "kernel.request"', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aHandler = t.mock.fn()
                const aErrorListener = t.mock.fn()
                const aRequestListener = t.mock.fn()
                const aControllerListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ControllerEvent, true)
                    assert.strictEqual(aRequestListener.mock.callCount(), 1)
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kRequestEvent, aRequestListener)
                    .on(kControllerEvent, aControllerListener)
                    .route('GET', '/', aHandler)

                await aKernel.callback()(aRequest, aResponse) 

                assert.strictEqual(aHandler.mock.callCount(), 1)
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
                assert.strictEqual(aControllerListener.mock.callCount(), 1)
            })

            it('should stop the request process after response "send()" method', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aHandler = t.mock.fn()
                const aErrorListener = t.mock.fn()
                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kControllerEvent, aFirstListener)
                    .on(kControllerEvent, aSecondListener)
                    .route('GET', '/', t.mock.fn())
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aHandler.mock.callCount(), 0)
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aFirstListener.mock.callCount(), 1)
                assert.strictEqual(aSecondListener.mock.callCount(), 0)
            })

        })

        it('should execute route controller with default arguments', async function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn()
            const aHandler = t.mock.fn(function (request, response) {
                assert.strictEqual(this instanceof EventTarget, true)
                assert.strictEqual(request instanceof HttpRequest, true)
                assert.strictEqual(response instanceof HttpResponse, true)
            })
    
            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .route('GET', '/', aHandler)
                
            await aKernel.callback()(aRequest, aResponse) 

            assert.strictEqual(aErrorListener.mock.callCount(), 0)
            assert.strictEqual(aHandler.mock.callCount(), 1)
        })

        describe('"kernel.response" event', async function() {

            it('should emit the event after controller execution', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aHandler = t.mock.fn()
                const aErrorListener = t.mock.fn()
                const aResponseListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ResponseEvent, true)
                    assert.strictEqual(aHandler.mock.callCount(), 1)
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kResponseEvent, aResponseListener)
                    .route('GET', '/', aHandler)

                await aKernel.callback()(aRequest, aResponse) 

                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aResponseListener.mock.callCount(), 1)
            })

            it('should emit the event after response "send()" method', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aHandler = t.mock.fn()
                const aErrorListener = t.mock.fn()
                const aRequestListener = t.mock.fn(event => event.response.send())
                const aResponselistener = t.mock.fn()

                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kRequestEvent, aRequestListener)
                    .on(kResponseEvent, aResponselistener)
                    .route('GET', '/', aHandler)
                
                await aKernel.callback()(aRequest, aResponse) 

                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
                assert.strictEqual(aResponselistener.mock.callCount(), 1)
            })

            it('should stop the event propagation after response "send()" method', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aErrorListener = t.mock.fn()
                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kResponseEvent, aFirstListener)
                    .on(kResponseEvent, aSecondListener)
                    .route('GET', '/', t.mock.fn())
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aFirstListener.mock.callCount(), 1)
                assert.strictEqual(aSecondListener.mock.callCount(), 0)
            })

        })    

        describe('"kernel.error" event', async function() {

            it('should emit the event when controller throw an Error', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn(event => console.log(event.error))
                const aErrorListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ErrorEvent, true)
                    assert.strictEqual(event.error, aError)
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aCriticalListener)
                    .route('GET', '/', t.mock.fn(_ => { throw aError }))
                
                await aKernel.callback()(aRequest, aResponse) 
    
                assert.strictEqual(aCriticalListener.mock.callCount(), 0)
                assert.strictEqual(aErrorListener.mock.callCount(), 1)

            })
        
            it('should emit the event when listener throw an Error', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aErrorListener = t.mock.fn(event => {
                    assert.strictEqual(event.error, aError)
                    assert.strictEqual(event instanceof ServerErrorAction, true)
                })
    
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kRequestEvent, t.mock.fn(_ => { throw aError }))
                    .route('GET', '/', t.mock.fn())
    
                await aKernel.callback()(aRequest, aResponse) 
    
                assert.strictEqual(aErrorListener.mock.callCount(), 1)
            })

            it('should stop the event propagation after response "send()" method', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aErrorListener = t.mock.fn()
                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
                const aCriticalListener = t.mock.fn()
        
                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kRequestEvent, t.mock.fn(_ => { throw new Error }))
                    .on(kErrorEvent, aFirstListener)
                    .on(kErrorEvent, aSecondListener)
                    .route('GET', '/', t.mock.fn())
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aFirstListener.mock.callCount(), 1)
                assert.strictEqual(aSecondListener.mock.callCount(), 0)
                assert.strictEqual(aCriticalListener.mock.callCount(), 0)
            })

        })   

        describe('"kernel.serialize" event', async function() {

            it('should emit the event if body is type of object', async function(t) {
                const expected = { foo: 'bar' }
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn()
                const aSerializeListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof SerializationEvent, true)
                    assert.strictEqual(event.body, expected)
                    event.body = JSON.stringify(event.body)
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kWarningEvent, aErrorListener)
                    .on(kSerializeEvent, aSerializeListener)
                    .route('GET', '/', (req, res) => res.send(expected))
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aSerializeListener.mock.callCount(), 1)
            })

            it('should set response body', async function(t) {
                const expected = { foo: 'bar' }
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn()
                const aFinishListener = t.mock.fn(event => {
                    assert.strictEqual(event.response.body, JSON.stringify(expected))
                })
                const aSerializeListener = t.mock.fn(event => {
                    event.body = JSON.stringify(event.body)
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kWarningEvent, aErrorListener)
                    .on(kSerializeEvent, aSerializeListener)
                    .on(kFinishEvent, aFinishListener)
                    .route('GET', '/', (req, res) => res.send(expected))
        
                await aKernel.callback()(aRequest, aResponse) 
        
                assert.strictEqual(aErrorListener.mock.callCount(), 0)
                assert.strictEqual(aFinishListener.mock.callCount(), 1)
                assert.strictEqual(aSerializeListener.mock.callCount(), 1)
            })
    
        })

        it('should write the response head', async function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn()

            aKernel
            .on(kErrorEvent, aErrorListener)
            .on(kCriticalEvent, aErrorListener)
            .route('GET', '/', (request, response) => { 
                response.statusCode = 404 
                response.headers.set('foo', 'bar')
            })
    
            await aKernel.callback()(aRequest, aResponse) 

            const anOutput = aResponse.outputData[0].data.split('\r\n')
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
            assert.strictEqual(anOutput[0], 'HTTP/1.1 404 Not Found')
            assert.strictEqual(anOutput[1], 'foo: bar')
        })
    
        it('should write the response body', async function(t) {
            const expected = 'foo'
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn()

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .route('GET', '/', (request, response) => response.send(expected))
        
            await aKernel.callback()(aRequest, aResponse) 

            const anOutput = aResponse.outputData[0].data.split('\r\n')
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
            assert.strictEqual(anOutput[1], 'content-type: text/plain; charset=utf-8')
            assert.strictEqual(anOutput[2], 'content-length: 3')
            assert.strictEqual(anOutput.at(-1), expected)
        })
    
        it('should end the response', async function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn()

            aKernel                    
            .on(kErrorEvent, aErrorListener)
            .on(kWarningEvent, aErrorListener)
            .on(kCriticalEvent, aErrorListener)
            .route('GET', '/', t.mock.fn())

            await aKernel.callback()(aRequest, aResponse) 

            assert.strictEqual(aErrorListener.mock.callCount(), 0)
            assert.strictEqual(aResponse.writableEnded, true) 
        })

        it('should end the response regardless of Errors', async function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn()

            aKernel
            .on(kErrorEvent, aErrorListener)
            .on(kCriticalEvent, aErrorListener)
            .route('GET', '/', (request, response) => response.body = new Readable({ read: _ => { throw new Error } }))

            await aKernel.callback()(aRequest, aResponse) 
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
            assert.strictEqual(aResponse.writableEnded, true) 
        })

        describe('"kernel.warning" event', async function() {

            it('should emit the event when during response writing occurs an error', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn()
                const aWarningListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof WarningEvent, true)
                    assert.strictEqual(event.error, aError)
                })
    
                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kWarningEvent, aWarningListener)
                    .route('GET', '/', (request, response) => response.send(new Readable({ read: _ => { throw aError } })))
    
                await aKernel.callback()(aRequest, aResponse)
                assert.strictEqual(aCriticalListener.mock.callCount(), 0)
                assert.strictEqual(aWarningListener.mock.callCount(), 1)
            })
    
            it('should not stop the event propagation after response "send()" method', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn()
                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
    
                aKernel
                    .on(kWarningEvent, aFirstListener)
                    .on(kWarningEvent, aSecondListener)
                    .on(kCriticalEvent, aCriticalListener)
                    .route('GET', '/', (request, response) => response.send(new Readable({ read: _ => { throw aError } })))
    
                await aKernel.callback()(aRequest, aResponse)

                assert.strictEqual(aCriticalListener.mock.callCount(), 0)
                assert.strictEqual(aFirstListener.mock.callCount(), 1)
                assert.strictEqual(aSecondListener.mock.callCount(), 1)
            })

        })

        describe('"kernel.finish" event', async function() {

            it('should emit the event after the response end', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aCriticalListener = t.mock.fn()
                const aFinishListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof FinishEvent, true)
                    assert.strictEqual(aResponse.writableEnded, true)
                })

                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kFinishEvent, aFinishListener)
                    .route('GET', '/', t.mock.fn())
                
                await aKernel.callback()(aRequest, aResponse)
                assert.strictEqual(aCriticalListener.mock.callCount(), 0)
                assert.strictEqual(aFinishListener.mock.callCount(), 1)
            })

            it('should not stop the event propagation after response "send()" method', async function(t) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn()
                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
    
                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kFinishEvent, aFirstListener)
                    .on(kFinishEvent, aSecondListener)
                    .route('GET', '/', t.mock.fn())
    
                await aKernel.callback()(aRequest, aResponse)

                assert.strictEqual(aFirstListener.mock.callCount(), 1)
                assert.strictEqual(aSecondListener.mock.callCount(), 1)
            })

        })

        describe('"kernel.critical" event', async function() {

            it('should emit the event when during "kernel.error" occurs an error', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof CriticalEvent, true)
                    assert.strictEqual(event.error, aError)
                })
    
                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kErrorEvent, event => { throw event.error })
                    .route('GET', '/', () => { throw aError } )
    
                await aKernel.callback()(aRequest, aResponse)
                assert.strictEqual(aCriticalListener.mock.callCount(), 1)
            })

            it('should emit the event when during "kernel.warning" occurs an error', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof CriticalEvent, true)
                    assert.strictEqual(event.error, aError)
                })
    
                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kWarningEvent, event => { throw event.error })
                    .route('GET', '/', (request, response) => response.send(new Readable({ read: _ => { throw aError } })))
    
                await aKernel.callback()(aRequest, aResponse)
                assert.strictEqual(aCriticalListener.mock.callCount(), 1)
            })

            it('should emit the event when during "kernel.finish" occurs an Error', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aCriticalListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof CriticalEvent, true)
                    assert.strictEqual(event.error, aError)
                })

                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kFinishEvent, event => { throw aError })
                    .route('GET', '/', t.mock.fn())

                await aKernel.callback()(aRequest, aResponse)

                assert.strictEqual(aCriticalListener.mock.callCount(), 1)
            })
    
            it('should not stop the event propagation after response "send()" method', async function(t) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
    
                aKernel
                    .on(kWarningEvent, aFirstListener)
                    .on(kWarningEvent, aSecondListener)
                    .route('GET', '/', (request, response) => response.send(new Readable({ read: _ => { throw aError } })))
    
                await aKernel.callback()(aRequest, aResponse)

                assert.strictEqual(aFirstListener.mock.callCount(), 1)
                assert.strictEqual(aSecondListener.mock.callCount(), 1)
            })

        })

    })

})