const assert = require("node:assert");
const router = require('find-my-way')
const { describe, it } = require('node:test');
const { PassThrough, Readable } = require("stream");
const { IncomingMessage, ServerResponse } = require("http");
const { STATUS_CODES } = require("node:http");
const { Kernel, KernelEmitter } = require('../lib/kernel.js')
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
const { HttpFeatures } = require("../lib/features.js");
const { Emitter } = require("../lib/emitter.js");

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

const sleep = (callback) => new Promise(resolve => process.nextTick(_ => resolve(callback())))

describe('Kernel test', function() {

    describe('"route()" method' , function() {

        it('should add route to the router', function(t) {
            const aController = t.mock.fn()
            const aRouter = router()
            const aKernel = new Kernel(aRouter)

            aKernel.route('GET', '/', aController)
            
            assert.deepStrictEqual(aRouter.findRoute('GET', '/'), { handler: aController, store: undefined, params: [] })
        })

        it('should return instance of Emitter', function(t) {
            const aKernel = new Kernel(router())

            const aRoute = aKernel.route('GET', '/', t.mock.fn())
            assert.strictEqual(aRoute instanceof Emitter, true)
        })

        it('should return instance of Emitter', function(t) {
            const aKernel = new Kernel(router())

            const aRoute = aKernel.route('GET', '/', t.mock.fn())
            assert.strictEqual(aRoute instanceof Emitter, true)
        })

    })

    describe('"callback()" method', function() {

        it('should execute global and local event listeners',function(t, done) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aGlobalListenerCallback = t.mock.fn()
            
            const aErrorListener = t.mock.fn(done)
            const aGlobalListener = t.mock.fn(_ => sleep(aGlobalListenerCallback))
            const aRouteListener = t.mock.fn(_ => {
                assert.strictEqual(aGlobalListenerCallback.mock.callCount(), 1)
                done()
            })

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .on(kRequestEvent, aGlobalListener)
                .route('GET', '/', t.mock.fn())
                .on(kRequestEvent, aRouteListener)

            aKernel.callback()(aRequest, aResponse) 

        })

        describe('"kernel.request" event', function() {

            it('should emit the at the start of pipeline', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aRequestListenerCallback = t.mock.fn()

                const aErrorListener = t.mock.fn(done)
                const aRequestListenerOne = t.mock.fn(_ => sleep(aRequestListenerCallback))
                const aRequestListenerTwo = t.mock.fn(event => {
                    assert.strictEqual(event instanceof RequestEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.request instanceof HttpRequest, true)
                    assert.strictEqual(event.response instanceof HttpResponse, true)
                    assert.strictEqual(event.features instanceof HttpFeatures, true)
                    assert.strictEqual(aRequestListenerCallback.mock.callCount(), 1)
                })
        
                const aRoute = aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kRequestEvent, aRequestListenerOne)
                    .on(kRequestEvent, aRequestListenerTwo)
                    .route('GET', '/', t.mock.fn())
        
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aRequestListenerTwo.mock.callCount(), 1)
                    done()
                })
            })
    
            it('should further the request process after response "send()" method', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aController = t.mock.fn()
                const aErrorListener = t.mock.fn(done)
                const aControllerListener = t.mock.fn()
                const aRequestListenerOne = t.mock.fn(event => sleep(_ => event.response.send()))
                const aRequestListenerTwo = t.mock.fn()
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kRequestEvent, aRequestListenerOne)
                    .on(kRequestEvent, aRequestListenerTwo)
                    .on(kControllerEvent, aControllerListener)
                    .on(kCriticalEvent, aErrorListener)
                    .route('GET', '/', aController)
    
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aController.mock.callCount(), 0)
                    assert.strictEqual(aRequestListenerOne.mock.callCount(), 1)
                    assert.strictEqual(aRequestListenerTwo.mock.callCount(), 0)
                    assert.strictEqual(aControllerListener.mock.callCount(), 0)
                    done()
                })

            })
    
        })

        it('should throw an Error when controller is not defined', function(t, done) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aCriticalListener = t.mock.fn(done)
            const aErrorListener = t.mock.fn(event => {
                assert.strictEqual(event.error.message, 'Route is not found.')
                assert.strictEqual(event.error.status, 404)
                assert.strictEqual(event.error.response, STATUS_CODES[404])
                done()
            })

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aCriticalListener)
                .route('GET', '/foo', t.mock.fn())
    
            aKernel.callback()(aRequest, aResponse) 
        })    

        it('should not throw an Error when controller is not defined but pipeline was stopped', function(t, done) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn(done)
            const aRequestListener = t.mock.fn(event => {
                event.response.send()
            })

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .on(kRequestEvent, aRequestListener)
                .route('GET', '/foo', t.mock.fn())
    
            aKernel.callback()(aRequest, aResponse) 

            setImmediate(_ => {
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
                done()
            })

        })    

        describe('"kernel.parse" event', function() {

            it('should emit the event after "kernel.request"', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aRequestListenerCallback = t.mock.fn()
        
                const aErrorListener = t.mock.fn(done)
                const aRequestListener = t.mock.fn(_ => sleep(aRequestListenerCallback))
                const aParseListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ParseEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.request instanceof HttpRequest, true)
                    assert.strictEqual(event.body, event.request.raw)
                    assert.strictEqual(aRequestListenerCallback.mock.callCount(), 1)
                })
        
                const aRoute = aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kRequestEvent, aRequestListener)
                    .on(kParseEvent, aParseListener)
                    .route('GET', '/', t.mock.fn())
        
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aParseListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should set the request body', function(t, done) {
                const expected = 'foo'
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn(done)
                const aParseListener = t.mock.fn(event => event.body = expected)
                const aController = t.mock.fn((ctx) => {
                    assert.strictEqual(ctx.request.body, expected)
                    done()
                })
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kParseEvent, aParseListener)
                    .route('GET', '/', aController)
        
                aKernel.callback()(aRequest, aResponse) 
            })
    
        })

        describe('"kernel.controller" event', function() {

            it('should emit the event after "kernel.request" and "kernel.parse" events', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aRequestListenerCallback = t.mock.fn()

                const aErrorListener = t.mock.fn(done)
                const aParseListener = t.mock.fn()
                const aRequestListener = t.mock.fn(_ => sleep(aRequestListenerCallback))
                const aControllerListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ControllerEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.request instanceof HttpRequest, true)
                    assert.strictEqual(event.response instanceof HttpResponse, true)
                    assert.strictEqual(event.features instanceof HttpFeatures, true)
                    assert.strictEqual(aParseListener.mock.callCount(), 1)
                    assert.strictEqual(aRequestListener.mock.callCount(), 1)
                    assert.strictEqual(aRequestListenerCallback.mock.callCount(), 1)
                })
        
                const aRoute = aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kParseEvent, aParseListener)
                    .on(kRequestEvent, aRequestListener)
                    .on(kControllerEvent, aControllerListener)
                    .route('GET', '/', t.mock.fn())

                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aControllerListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should further the request process after response "send()" method', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aController = t.mock.fn()
                const aErrorListener = t.mock.fn(done)
                const aFirstListener = t.mock.fn(event => sleep(_ => event.response.send()))
                const aSecondListener = t.mock.fn()
        
                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kControllerEvent, aFirstListener)
                    .on(kControllerEvent, aSecondListener)
                    .route('GET', '/', t.mock.fn())
        
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aController.mock.callCount(), 0)
                    assert.strictEqual(aFirstListener.mock.callCount(), 1)
                    assert.strictEqual(aSecondListener.mock.callCount(), 0)
                    done()
                })

            })

        })

        it('should execute route controller with default arguments', function(t) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn()
            const aController = t.mock.fn(function (ctx) {
                assert.strictEqual(this instanceof KernelEmitter, true)
                assert.strictEqual(ctx.target instanceof KernelEmitter, true)
                assert.strictEqual(ctx.request instanceof HttpRequest, true)
                assert.strictEqual(ctx.response instanceof HttpResponse, true)
                assert.strictEqual(ctx.features instanceof HttpFeatures, true)
            })
    
            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .route('GET', '/', aController)
                
            aKernel.callback()(aRequest, aResponse) 

            assert.strictEqual(aController.mock.callCount(), 1)
        })

        describe('"kernel.response" event', function() {

            it('should emit the event after controller execution', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aControllerCallback = t.mock.fn()

                const aController = t.mock.fn(_ => sleep(aControllerCallback))
                const aErrorListener = t.mock.fn(done)
                const aResponseListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ResponseEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.request instanceof HttpRequest, true)
                    assert.strictEqual(event.response instanceof HttpResponse, true)
                    assert.strictEqual(event.features instanceof HttpFeatures, true)
                    assert.strictEqual(aControllerCallback.mock.callCount(), 1)
                })
        
                const aRoute = aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kResponseEvent, aResponseListener)
                    .route('GET', '/', aController)

                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aResponseListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should emit the event after response "send()" method', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aController = t.mock.fn()
                const aErrorListener = t.mock.fn(done)
                const aRequestListener = t.mock.fn(event => sleep(_ => event.response.send()))

                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kRequestEvent, aRequestListener)
                    .route('GET', '/', aController)
                
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aRequestListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should stop the event propagation after response "send()" method', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aErrorListener = t.mock.fn(done)
                const aResponseListenerOne = t.mock.fn(event => sleep(_ => event.response.send()))
                const aResponseListenerTwo = t.mock.fn()

                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kResponseEvent, aResponseListenerOne)
                    .on(kResponseEvent, aResponseListenerTwo)
                    .route('GET', '/', t.mock.fn())
        
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aResponseListenerOne.mock.callCount(), 1)
                    assert.strictEqual(aResponseListenerTwo.mock.callCount(), 0)
                    done()
                })

            })

        })    

        describe('"kernel.error" event', function() {

            it('should emit the event when controller throw an Error', function(t, done) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn(done)
                const aErrorListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof ErrorEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.request instanceof HttpRequest, true)
                    assert.strictEqual(event.response instanceof HttpResponse, true)
                    assert.strictEqual(event.features instanceof HttpFeatures, true)
                    assert.strictEqual(event.error, aError)
                })
        
                const aRoute = aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aCriticalListener)
                    .route('GET', '/', t.mock.fn(_ => { throw aError }))
                
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aErrorListener.mock.callCount(), 1)
                    done()
                })

            })
        
            it('should emit the event when listener throw an Error', function(t, done) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aController = t.mock.fn()
                const aCriticalListener = t.mock.fn(done)
                const aErrorListener = t.mock.fn(event => {
                    assert.strictEqual(aController.mock.callCount(), 0)
                    assert.strictEqual(event instanceof ErrorEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.request instanceof HttpRequest, true)
                    assert.strictEqual(event.response instanceof HttpResponse, true)
                    assert.strictEqual(event.features instanceof HttpFeatures, true)
                    assert.strictEqual(event.error, aError)
                })
    
                const aRoute = aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kErrorEvent, aErrorListener)
                    .on(kRequestEvent, t.mock.fn(_ => Promise.reject(aError)))
                    .route('GET', '/', aController)
    
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aErrorListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should stop the event propagation after response "send()" method', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aFirstListener = t.mock.fn(event => event.response.send())
                const aSecondListener = t.mock.fn()
                const aCriticalListener = t.mock.fn()
        
                aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kRequestEvent, t.mock.fn(_ => { throw new Error }))
                    .on(kErrorEvent, aFirstListener)
                    .on(kErrorEvent, aSecondListener)
                    .route('GET', '/', t.mock.fn())
        
                aKernel.callback()(aRequest, aResponse) 

                setImmediate(_ => {
                    assert.strictEqual(aFirstListener.mock.callCount(), 1)
                    assert.strictEqual(aSecondListener.mock.callCount(), 0)
                    assert.strictEqual(aCriticalListener.mock.callCount(), 0)
                    done()
                })

            })

        })   

        describe('"kernel.serialize" event', function() {

            it('should emit the event after "kernel.response" if body is type of object', function(t, done) {
                const expected = { foo: 'bar' }
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aResponseListenerCallback = t.mock.fn()
        
                const aErrorListener = t.mock.fn(done)
                const aResponseListener = t.mock.fn(_ => sleep(aResponseListenerCallback))
                const aSerializeListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof SerializationEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.response instanceof HttpResponse, true)
                    assert.strictEqual(event.body, expected)
                    assert.strictEqual(aResponseListenerCallback.mock.callCount(), 1)
                    event.body = JSON.stringify(event.body)
                })

                const aRoute = aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kWarningEvent, aErrorListener)
                    .on(kResponseEvent, aResponseListener)
                    .on(kSerializeEvent, aSerializeListener)
                    .route('GET', '/', (ctx) => ctx.response.send(expected))
        
                aKernel.callback()(aRequest, aResponse) 
        
                setImmediate(_ => {
                    assert.strictEqual(aSerializeListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should set the response body', function(t, done) {
                const expected = { foo: 'bar' }
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
        
                const aErrorListener = t.mock.fn(done)
                const aSerializeListener = t.mock.fn(event => event.body = JSON.stringify(event.body))
                const aFinishListener = t.mock.fn(event => {
                    assert.strictEqual(event.response.body, JSON.stringify(expected))
                })

                aKernel
                    .on(kErrorEvent, aErrorListener)
                    .on(kCriticalEvent, aErrorListener)
                    .on(kWarningEvent, aErrorListener)
                    .on(kSerializeEvent, aSerializeListener)
                    .on(kFinishEvent, aFinishListener)
                    .route('GET', '/', (ctx) => ctx.response.send(expected))
        
                aKernel.callback()(aRequest, aResponse) 
                        
                setImmediate(_ => {
                    assert.strictEqual(aFinishListener.mock.callCount(), 1)
                    assert.strictEqual(aSerializeListener.mock.callCount(), 1)
                    done()
                })
        
            })
    
        })

        describe('"kernel.finish" event', function() {

            it('should emit the event after the response end', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aWarningListener = t.mock.fn(done)
                const aFinishListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof FinishEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.request instanceof HttpRequest, true)
                    assert.strictEqual(event.response instanceof HttpResponse, true)
                    assert.strictEqual(event.features instanceof HttpFeatures, true)
                    assert.strictEqual(aResponse.writableEnded, true)
                })

                const aRoute = aKernel
                    .on(kWarningEvent, aWarningListener)
                    .on(kFinishEvent, aFinishListener)
                    .route('GET', '/', t.mock.fn())
                
                aKernel.callback()(aRequest, aResponse)

                setImmediate(_ => {
                    assert.strictEqual(aFinishListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should not stop the event propagation after response "send()" method', function(t, done) {
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aWarningListener = t.mock.fn(done)
                const aFirstListener = t.mock.fn(event => sleep(_ => event.response.send()))
                const aSecondListener = t.mock.fn()
    
                aKernel
                    .on(kWarningEvent, aWarningListener)
                    .on(kFinishEvent, aFirstListener)
                    .on(kFinishEvent, aSecondListener)
                    .route('GET', '/', t.mock.fn())
    
                aKernel.callback()(aRequest, aResponse)

                setImmediate(_ => {
                    assert.strictEqual(aFirstListener.mock.callCount(), 1)
                    assert.strictEqual(aSecondListener.mock.callCount(), 1)
                    done()
                })

            })

        })

        describe('"kernel.warning" event', function() {

            it('should emit the event when during event with "captureRejection" occurs an error', function(t, done) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aFinishListener = t.mock.fn(_ => Promise.reject(aError))
                const aCriticalListener = t.mock.fn(done)
                const aWarningListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof WarningEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.error, aError)
                })
    
                const aRoute = aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kWarningEvent, aWarningListener)
                    .on(kFinishEvent, aFinishListener)
                    .route('GET', '/', t.mock.fn())

                aKernel.callback()(aRequest, aResponse)

                setImmediate(_ => {
                    assert.strictEqual(aWarningListener.mock.callCount(), 1)
                    done()
                })

            })

        })

        describe('"kernel.critical" event', function() {

            it('should emit the event when during "kernel.error" occurs an error', function(t, done) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aCriticalListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof CriticalEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.error, aError)
                })
    
                const aRoute = aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kErrorEvent, event => { throw event.error })
                    .route('GET', '/', () => { throw aError } )
    
                aKernel.callback()(aRequest, aResponse)

                setImmediate(_ => {
                    assert.strictEqual(aCriticalListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should emit the event when during "kernel.warning" occurs an error', function(t, done) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)
    
                const aFinishListener = t.mock.fn(_ => Promise.reject(aError))
                const aWarningListener = t.mock.fn(event => { throw event.error })
                const aCriticalListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof CriticalEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.error, aError)
                })
    
                const aRoute = aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .on(kWarningEvent, aWarningListener)
                    .on(kFinishEvent, aFinishListener)
                    .route('GET', '/', t.mock.fn())

                aKernel.callback()(aRequest, aResponse)

                setImmediate(_ => {
                    assert.strictEqual(aCriticalListener.mock.callCount(), 1)
                    done()
                })

            })

            it('should emit the event when during the response writing occurs an Error', function(t, done) {
                const aError = new Error()
                const aKernel = new Kernel(router())
                const aRequest = new RequestMock
                const aResponse = new ResponseMock(aRequest)

                const aCriticalListener = t.mock.fn(event => {
                    assert.strictEqual(event instanceof CriticalEvent, true)
                    assert.strictEqual(event.target, aRoute)
                    assert.strictEqual(event.error, aError)
                })

                const aRoute = aKernel
                    .on(kCriticalEvent, aCriticalListener)
                    .route('GET', '/', (ctx) => ctx.response.send(new Readable({ read: _ => { throw aError } })))

                aKernel.callback()(aRequest, aResponse)

                setImmediate(_ => {
                    assert.strictEqual(aCriticalListener.mock.callCount(), 1)
                    done()
                })

            })

        })

        it('should pass the features through listeners ', function(t, done) {
            const key = 'foo'
            const value = 'bar'
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)
            const aErrorListener = t.mock.fn(done)

            const aRequestListener = t.mock.fn(event => event.features.set(key, value))
            const aControllerListener = t.mock.fn(event => assert.strictEqual(event.features.get(key), value))
            const aResponseListener = t.mock.fn(event => assert.strictEqual(event.features.get(key), value))
            const aFinishListener = t.mock.fn(event => assert.strictEqual(event.features.get(key), value))

            aKernel
                .on(kCriticalEvent, aErrorListener)
                .on(kErrorEvent, aErrorListener)
                .on(kWarningEvent, aErrorListener)
                .on(kRequestEvent, aRequestListener)
                .on(kControllerEvent, aControllerListener)
                .on(kResponseEvent, aResponseListener)
                .on(kFinishEvent, aFinishListener)
                .route('GET', '/', (ctx) => { 
                    assert.strictEqual(ctx.features.get(key), value)
                })
    
            aKernel.callback()(aRequest, aResponse) 

            setImmediate(_ => {
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
                assert.strictEqual(aControllerListener.mock.callCount(), 1)
                assert.strictEqual(aResponseListener.mock.callCount(), 1)
                assert.strictEqual(aFinishListener.mock.callCount(), 1)
                done()
            })

        })

        it('should write the response head', function(t, done) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)
            const aErrorListener = t.mock.fn(done)

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .route('GET', '/', (ctx) => { 
                    ctx.response.statusCode = 404 
                    ctx.response.setHeader('foo', 'bar')
                })
    
            aKernel.callback()(aRequest, aResponse) 

            setImmediate(_ => {
                const anOutput = aResponse.outputData[0].data.split('\r\n')
                assert.strictEqual(anOutput[0], 'HTTP/1.1 404 Not Found')
                assert.strictEqual(anOutput[1], 'foo: bar')
                done()
            })

        })
    
        it('should write the response body', function(t, done) {
            const expected = 'foo'
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn(done)

            aKernel
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .route('GET', '/', (ctx) => ctx.response.send(expected))
        
            aKernel.callback()(aRequest, aResponse) 

            setImmediate(_ => {
                const anOutput = aResponse.outputData[0].data.split('\r\n')
                assert.strictEqual(anOutput[1], 'content-type: text/plain; charset=utf-8')
                assert.strictEqual(anOutput[2], 'content-length: 3')
                assert.strictEqual(anOutput.at(-1), expected)
                done()
            })

        })
    
        it('should end the response', function(t, done) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aErrorListener = t.mock.fn(done)

            aKernel                    
                .on(kErrorEvent, aErrorListener)
                .on(kCriticalEvent, aErrorListener)
                .route('GET', '/', t.mock.fn())

            aKernel.callback()(aRequest, aResponse) 

            setImmediate(_ => {
                assert.strictEqual(aResponse.writableEnded, true) 
                done()
            })

        })

        it('should end the response regardless of Errors', function(t, done) {
            const aKernel = new Kernel(router())
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            aKernel
                .route('GET', '/', (ctx) => ctx.response.send(new Readable({ read: _ => { throw new Error } })))

            aKernel.callback()(aRequest, aResponse) 

            setImmediate(_ => {
                assert.strictEqual(aResponse.writableEnded, true) 
                done()
            })

        })

    })

})