const assert = require("node:assert");
const { describe, it } = require('node:test');
const { Readable } = require("node:stream");
const { ServerResponse } = require('http')
const { STATUS_CODES } = require("node:http");
const { Emitter } = require("../lib/emitter.js");
const { HttpRequest } = require("../lib/request.js");
const { HttpResponse } = require("../lib/response.js");
const { Cookie } = require("@vikhola/cookies");
const { 
    RequestAction, 
    ControllerAction, 
    ResponseAction, 
    WritingAction,
    ErrorAction,
    FinishAction,
    CriticalAction,
    WarningAction,
} = require('../lib/actions.js');
const { 
    RequestEvent, 
    ControllerEvent, 
    ResponseEvent, 
    SerializationEvent, 
    WarningEvent, 
    CriticalEvent, 
    FinishEvent, 
    ErrorEvent, 
    TrailersEvent,
    ParseEvent
} = require("../lib/events.js");
const {
    kRequestEvent, 
    kParseEvent, 
    kControllerEvent, 
    kResponseEvent, 
    kErrorEvent,
    kSerializeEvent, 
    kTrailersEvent,
    kWarningEvent, 
    kFinishEvent, 
    kCriticalEvent, 
    kRequestBody,
    kResponseBody
}  = require('../lib/const');
const { HttpFeatures } = require("../lib/features.js");

class ErrorMock extends Error {

    constructor(message, status, content) {
        super(message)
        this.status = status
        this.content = content

    }

}

class ContextMock {

    constructor({ target, response, method = "GET", controller = () => {},  abortController } = {}) {
        this.target = target || new Emitter()
        this.controller = controller
        this.features = new HttpFeatures()
        this.abortController = abortController || new AbortController()
        this.request = new HttpRequest(this.features, { method }, {})
        this.response = response || new HttpResponse(this.features, new ServerResponse({ method: "GET" }), this.abortController)
    }
        
}

const subscribe = (command, args, error) => new Promise((resolve, reject) => command((error) => error ? reject(error) : resolve(), args, error))

describe('"RequestAction" test', function() {
    
    describe('"RequestEvent"', function() {

        it('should emit "RequestEvent" event', async function(t) {
            const aContext = new ContextMock()
    
            const aRequestListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof RequestEvent, true)
                assert.strictEqual(event.target, aContext.target)
                assert.strictEqual(event.features, aContext.features)
                assert.strictEqual(event.request instanceof HttpRequest, true)
                assert.strictEqual(event.response instanceof HttpResponse, true)
            })
    
            aContext.target.on(kRequestEvent, aRequestListener)

            await subscribe(RequestAction, aContext)
            
            assert.strictEqual(aRequestListener.mock.callCount(), 1)
        })

        it('should stop "RequestEvent" event propagation if the response send method is called',async function(t) {
            const anAbortController = new AbortController()
            const aContext = new ContextMock({ abortController: anAbortController })

            const aRequestListenerOne = t.mock.fn((event) => event.response.send())
            const aRequestListenerTwo = t.mock.fn((event) => event.response.send())
    
            aContext.target.on(kRequestEvent, aRequestListenerOne)
            aContext.target.on(kRequestEvent, aRequestListenerTwo)

            await subscribe(RequestAction, aContext)
            
            assert.strictEqual(aRequestListenerOne.mock.callCount(), 1)
            assert.strictEqual(aRequestListenerTwo.mock.callCount(), 0)
        })

    })

    describe('"RequestParseEvent"', function() {

        it('should emit "RequestParseEvent" event', async function(t) {
            const expected = 'foo'
            const aContext = new ContextMock()
    
            const aParseListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof ParseEvent, true)
                assert.strictEqual(event.body, undefined)
                assert.strictEqual(event.target, aContext.target)
                assert.strictEqual(event.request, aContext.request)

                event.body = (expected)
            })
    
            aContext.target.on(kParseEvent, aParseListener)

            await subscribe(RequestAction, aContext)
            
            assert.strictEqual(aParseListener.mock.callCount(), 1)
            assert.strictEqual(aContext.request.body, expected)
        })

        it('should emit "RequestParseEvent" after "RequestEvent" event', async function(t) {
            const expected = 'foo'
            const aContext = new ContextMock()
    
            const aRequestListener = t.mock.fn(_ => new Promise(resolve => setImmediate(_ => {
                assert.strictEqual(aParseListener.mock.callCount(), 0)
                resolve()
            })))
            const aParseListener = t.mock.fn((event) => {
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
                event.body = (expected)
            })
    
            aContext.target.on(kRequestEvent, aRequestListener)
            aContext.target.on(kParseEvent, aParseListener)

            await subscribe(RequestAction, aContext)
            
            assert.strictEqual(aParseListener.mock.callCount(), 1)
            assert.strictEqual(aContext.request.body, expected)
        })

    })

    describe('"ControllerEvent"', function() {

        it('should emit "ControllerEvent" event', async function(t) {
            const aContext = new ContextMock()

            const aControllerListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof ControllerEvent, true)
                assert.strictEqual(event.target, aContext.target)
                assert.strictEqual(event.features, aContext.features)
                assert.strictEqual(event.request instanceof HttpRequest, true)
                assert.strictEqual(event.response instanceof HttpResponse, true)
            })

            aContext.target.on(kControllerEvent, aControllerListener)

            await subscribe(RequestAction, aContext)
            
            assert.strictEqual(aControllerListener.mock.callCount(), 1)
        })

        it('should emit "ControllerEvent" after "RequestEvent" and "RequestParseEvent" events', async function(t) {
            const expected = 'foo'
            const aContext = new ContextMock()
    
            const aRequestListener = t.mock.fn(_ => new Promise(resolve => setImmediate(_ => {
                assert.strictEqual(aParseListener.mock.callCount(), 0)
                assert.strictEqual(aControllerListener.mock.callCount(), 0)
                resolve()
            })))
            const aParseListener = t.mock.fn((event) => {
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
                assert.strictEqual(aControllerListener.mock.callCount(), 0)
                event.body = (expected)
            })
            const aControllerListener = t.mock.fn(_ => {
                assert.strictEqual(aRequestListener.mock.callCount(), 1)
                assert.strictEqual(aParseListener.mock.callCount(), 1)
            })
    
            aContext.target.on(kRequestEvent, aRequestListener)
            aContext.target.on(kParseEvent, aParseListener)
            aContext.target.on(kControllerEvent, aControllerListener)

            await subscribe(RequestAction, aContext)
            
            assert.strictEqual(aParseListener.mock.callCount(), 1)
            assert.strictEqual(aContext.request.body, expected)
        })

        it('should stop "ControllerEvent" event propagation if the response send method is called', async function(t) {
            const anAbortController = new AbortController()
            const aContext = new ContextMock({ abortController: anAbortController })

            const aControllerListenerOne = t.mock.fn((event) => event.response.send())
            const aControllerListenerTwo = t.mock.fn((event) => event.response.send())
    
            aContext.target.on(kControllerEvent, aControllerListenerOne)
            aContext.target.on(kControllerEvent, aControllerListenerTwo)

            await subscribe(RequestAction, aContext)
            
            assert.strictEqual(aControllerListenerOne.mock.callCount(), 1)
            assert.strictEqual(aControllerListenerTwo.mock.callCount(), 0)
        })

    })

    it('should call callback with an NotFound error when arguments controller is undefined', async function(t) {
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        aContext.controller = undefined

        const aRequestListener = t.mock.fn()
        const aParseListener = t.mock.fn()
        const aControllerListener = t.mock.fn()

        aContext.target.on(kParseEvent, aParseListener)
        aContext.target.on(kRequestEvent, aRequestListener)
        aContext.target.on(kControllerEvent, aControllerListener)

        await assert.rejects(_ => subscribe(RequestAction, aContext), { message: "Route is not found." })
        
        assert.strictEqual(aRequestListener.mock.callCount(), 1)
        assert.strictEqual(aParseListener.mock.callCount(), 0)
        assert.strictEqual(aControllerListener.mock.callCount(), 0)
    })

    it('should call callback after last event is called', function(t) {
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })
        const aCallback = t.mock.fn()

        const aRequestListener = t.mock.fn()
        const aControllerListener = t.mock.fn()

        aContext.target.on(kRequestEvent, aRequestListener)
        aContext.target.on(kControllerEvent, aControllerListener)

        RequestAction(aCallback, aContext)
        
        assert.strictEqual(aCallback.mock.callCount(), 1)
        assert.strictEqual(aRequestListener.mock.callCount(), 1)
        assert.strictEqual(aControllerListener.mock.callCount(), 1)
    })

    it('should call async and sync events sequentally', async function(t) {
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aCallback = t.mock.fn()

        const aRequestListener = t.mock.fn((event) => new Promise(resolve => setImmediate(resolve(aCallback()))))
        const aControllerListener = t.mock.fn((event) => {
            assert.strictEqual(aCallback.mock.callCount(), 1)
        })

        aContext.target.on(kRequestEvent, aRequestListener)
        aContext.target.on(kControllerEvent, aControllerListener)

        await subscribe(RequestAction, aContext)
        
        assert.strictEqual(aRequestListener.mock.callCount(), 1)
        assert.strictEqual(aControllerListener.mock.callCount(), 1)
    })

    it('should stop pipeline propagation and call callback if the response send method is called', async function(t) {
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aRequestListener = t.mock.fn((event) => new Promise(resolve => setImmediate(_ => { resolve(event.response.send()) })))
        const aControllerListener = t.mock.fn((event) => event.response.send())

        aContext.target.on(kRequestEvent, aRequestListener)
        aContext.target.on(kControllerEvent, aControllerListener)

        await subscribe(RequestAction, aContext)
        
        assert.strictEqual(aRequestListener.mock.callCount(), 1)
        assert.strictEqual(aControllerListener.mock.callCount(), 0)
    })

    it('should stop event and pipeline propagation then immediately call callback if error occurs', async function(t) {
        const aError = new Error('oops')
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aRequestListener = t.mock.fn((event) => new Promise((resolve, reject) => setImmediate(_ => reject(aError))))
        const aControllerListener = t.mock.fn()

        aContext.target.on(kRequestEvent, aRequestListener)
        aContext.target.on(kControllerEvent, aControllerListener)

        await assert.rejects(_ => subscribe(RequestAction, aContext), aError)

        assert.strictEqual(aRequestListener.mock.callCount(), 1)
        assert.strictEqual(aControllerListener.mock.callCount(), 0)
    })

})

describe('"ControllerAction" test', function() {

    it('should execute abortController', async function(t) {
        const aController = t.mock.fn()
        const aContext = new ContextMock({ controller: aController })

        await subscribe(ControllerAction, aContext)

        assert.strictEqual(aController.mock.callCount(), 1)
    })

    it('should pass object with request, response, target, features as argument and target is this', async function(t) {
        const aController = t.mock.fn(function (ctx) {
            assert.strictEqual(this, aContext.target)
            assert.strictEqual(ctx.target, aContext.target)
            assert.strictEqual(ctx.features, aContext.features)
            assert.strictEqual(ctx.request, aContext.request)
            assert.strictEqual(ctx.response, aContext.response)
        })
        const aContext = new ContextMock({ controller: aController })

        await subscribe(ControllerAction, aContext)

        assert.strictEqual(aController.mock.callCount(), 1)
    })

    it('should call callback after abortController execution', async function(t) {
        let called = false
        const aController = t.mock.fn(function (ctx) {
            return new Promise(resolve => setImmediate(_ => resolve(called = true)))
        })
        const aContext = new ContextMock({ controller: aController })

        await subscribe(ControllerAction, aContext)

        assert.strictEqual(called, true)
    })

    it('should immediately call callback if error occurs', async function(t) {
        const aError = new Error('oops')
        const aController = t.mock.fn(function (ctx) {
            return new Promise((resolve, reject) => setImmediate(_ => reject(aError)))
        })
        const aContext = new ContextMock({ controller: aController })

        await assert.rejects(_ => subscribe(ControllerAction, aContext), aError)
    })

})

describe('"ResponseEventCommand" test', function() {

    describe('"ResponseEvent"', function() {

        it('should emit "ResponseEvent"', async function(t) {
            const aContext = new ContextMock()
    
            const aResponseListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof ResponseEvent, true)
                assert.strictEqual(event.target, aContext.target)
                assert.strictEqual(event.features, aContext.features)
                assert.strictEqual(event.request instanceof HttpRequest, true)
                assert.strictEqual(event.response instanceof HttpResponse, true)
            })
    
            aContext.target.on(kResponseEvent, aResponseListener)

            await subscribe(ResponseAction, aContext)
                
            assert.strictEqual(aResponseListener.mock.callCount(), 1)
        })
    
        it('should stop "ResponseEvent" event propagation if the response send method is called', async function(t) {
            const anAbortController = new AbortController()
            const aContext = new ContextMock({ abortController: anAbortController })

            const aResponseListenerOne = t.mock.fn((event) => event.response.send())
            const aResponseListenerTwo = t.mock.fn((event) => event.response.send())
    
            aContext.target.on(kResponseEvent, aResponseListenerOne)
            aContext.target.on(kResponseEvent, aResponseListenerTwo)

            await subscribe(ResponseAction, aContext)
            
            assert.strictEqual(aResponseListenerOne.mock.callCount(), 1)
            assert.strictEqual(aResponseListenerTwo.mock.callCount(), 0)
        })

    })

    it('should call callback after last event is called', function(t) {
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })
        const aCallback = t.mock.fn()

        const aResponseListener = t.mock.fn()

        aContext.target.on(kResponseEvent, aResponseListener)

        ResponseAction(aCallback, aContext)
        
        assert.strictEqual(aCallback.mock.callCount(), 1)
        assert.strictEqual(aResponseListener.mock.callCount(), 1)
    })

    it('should stop event propagation then immediately call callback if error occurs', async function(t) {
        const aError = new Error('oops')
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aResponseListenerOne = t.mock.fn((event) => new Promise((resolve, reject) => setImmediate(_ => reject(aError))))
        const aResponseListenerTwo = t.mock.fn()

        aContext.target.on(kResponseEvent, aResponseListenerOne)
        aContext.target.on(kResponseEvent, aResponseListenerTwo)

        await assert.rejects(_ => subscribe(ResponseAction, aContext), aError)

        assert.strictEqual(aResponseListenerOne.mock.callCount(), 1)
        assert.strictEqual(aResponseListenerTwo.mock.callCount(), 0)
    })

})

describe('"ErrorAction" test', function() {

    describe('"ErrorEvent"', function() {

        it('should emit "ErrorEvent"', async function(t) {
            const aError = new Error()
            const aContext = new ContextMock()
    
            const aErrorListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof ErrorEvent, true)
                assert.strictEqual(event.error, aError)
                assert.strictEqual(event.target, aContext.target)
                assert.strictEqual(event.features, aContext.features)
                assert.strictEqual(event.request instanceof HttpRequest, true)
                assert.strictEqual(event.response instanceof HttpResponse, true)
            })
    
            aContext.target.on(kErrorEvent, aErrorListener)
            
            await subscribe(ErrorAction, aContext, aError)

            assert.strictEqual(aErrorListener.mock.callCount(), 1)
        })
    
        it('should stop "ErrorEvent" event propagation if the response send method is called', async function(t) {
            const aError = new Error()
            const anAbortController = new AbortController()
            const aContext = new ContextMock({ abortController: anAbortController })

            const aErrorListenerOne = t.mock.fn((event) => event.response.send())
            const aErrorListenerTwo = t.mock.fn((event) => event.response.send())
    
            aContext.target.on(kErrorEvent, aErrorListenerOne)
            aContext.target.on(kErrorEvent, aErrorListenerTwo)

            await subscribe(ErrorAction, aContext, aError)
            
            assert.strictEqual(aErrorListenerOne.mock.callCount(), 1)
            assert.strictEqual(aErrorListenerTwo.mock.callCount(), 0)
        })

    })

    it('should process error and set the response default payload', async function(t) {
        const aError = new Error()
        const aContext = new ContextMock()

        await subscribe(ErrorAction, aContext, aError)

        assert.strictEqual(aContext.response.body, STATUS_CODES[500])
        assert.strictEqual(aContext.response.statusCode, 500)
    })

    it('should process error and set default response body that matches error code', async function(t) {
        const aError = new ErrorMock('Oops', 404)
        const aContext = new ContextMock()

        await subscribe(ErrorAction, aContext, aError)

        assert.strictEqual(aContext.response.body, STATUS_CODES[404])
        assert.strictEqual(aContext.response.statusCode, 404)
    })

    it('should process error and set default code if error code is not number', async function(t) {
        const aError = new ErrorMock('Oops', 'foo')
        const aContext = new ContextMock()

        await subscribe(ErrorAction, aContext, aError)

        assert.strictEqual(aContext.response.body, STATUS_CODES[500])
        assert.strictEqual(aContext.response.statusCode, 500)
    })

    it('should process error and set response response body to the error content if present', async function(t) {
        const aError = new ErrorMock('Oops', 404, 'foo')
        const aContext = new ContextMock()

        await subscribe(ErrorAction, aContext, aError)

        assert.strictEqual(aContext.response.body, 'foo')
        assert.strictEqual(aContext.response.statusCode, 404)
    })

    it('should immediately call callback if the error is null', async function(t) {
        const aCallback = t.mock.fn()
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aErrorListener = t.mock.fn()

        aContext.target.on(kErrorEvent, aErrorListener)

        ErrorAction(aCallback, aContext)
        
        assert.strictEqual(aCallback.mock.callCount(), 1)
        assert.strictEqual(aErrorListener.mock.callCount(), 0)
    })

    it('should stop pipeline propagation and call callback if the response send method is called', async function(t) {
        const aError = new Error()
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aErrorListenerOne = t.mock.fn((event) => 
            new Promise(resolve => setImmediate(_ => { 
                event.response.statusCode = 404
                resolve(event.response.send(STATUS_CODES[404])) 
            }))
        )
        const aErrorListenerTwo = t.mock.fn((event) => event.response.send())

        aContext.target.on(kErrorEvent, aErrorListenerOne)
        aContext.target.on(kErrorEvent, aErrorListenerTwo)

        await subscribe(ErrorAction, aContext, aError)
        
        assert.strictEqual(aErrorListenerOne.mock.callCount(), 1)
        assert.strictEqual(aErrorListenerTwo.mock.callCount(), 0)
        assert.strictEqual(aContext.response.body, STATUS_CODES[404])
        assert.strictEqual(aContext.response.statusCode, 404)
    })

    it('should stop event propagation then call callback if error occurs', async function(t) {
        const aError = new Error('oops')
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aErrorListenerOne = t.mock.fn((event) => new Promise((resolve, reject) => setImmediate(_ => reject(aError))))
        const aErrorListenerTwo = t.mock.fn()

        aContext.target.on(kErrorEvent, aErrorListenerOne)
        aContext.target.on(kErrorEvent, aErrorListenerTwo)

        await assert.rejects(_ => subscribe(ErrorAction, aContext, new Error()), aError)

        assert.strictEqual(aErrorListenerOne.mock.callCount(), 1)
        assert.strictEqual(aErrorListenerTwo.mock.callCount(), 0)
    })

    it('should process unexpected error from the event before calling callback', async function(t) {
        const aError = new Error('oops')
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aErrorListener = t.mock.fn((event) => new Promise((resolve, reject) => setImmediate(_ => reject(aError))))

        aContext.target.on(kErrorEvent, aErrorListener)

        await assert.rejects(_ => subscribe(ErrorAction, aContext, new Error()), aError)

        assert.strictEqual(aContext.response.body, STATUS_CODES[500])
        assert.strictEqual(aContext.response.statusCode, 500)
    })

})

describe('"WritingAction"', function() {

    describe('"SerializeEvent"', function() {

        it('should emit "SerializeEvent" if the response has body that cannot be sent', async function(t) {
            const expected = { a: 1 }
            const aContext = new ContextMock()

            const aSerializeListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof SerializationEvent, true)
                assert.strictEqual(event.body, expected)
                assert.strictEqual(event.target, aContext.target)
                assert.strictEqual(event.response instanceof HttpResponse, true)

                return event.body = JSON.stringify(event.body)
            })
    
            aContext.target.on(kSerializeEvent, aSerializeListener)
            aContext.response.setHeader('Content-Type', 'text/plain')
            aContext.features.set(kResponseBody, expected)

            await subscribe(WritingAction, aContext)
                
            assert.strictEqual(aSerializeListener.mock.callCount(), 1)
        })
    
        it('should stop "SerializeEvent event propagation if the response send method is called', async function(t) {
            const anAbortController = new AbortController()
            const aContext = new ContextMock({ abortController: anAbortController })

            const aSerializeListenerOne = t.mock.fn((event) => event.response.send('foo'))
            const aSerializeListenerTwo = t.mock.fn((event) => event.response.send())
    
            aContext.target.on(kSerializeEvent, aSerializeListenerOne)
            aContext.target.on(kSerializeEvent, aSerializeListenerTwo)
            aContext.features.set(kResponseBody, 123)

            await subscribe(WritingAction, aContext)
            
            assert.strictEqual(aSerializeListenerOne.mock.callCount(), 1)
            assert.strictEqual(aSerializeListenerTwo.mock.callCount(), 0)
        })

    })

    describe('"TrailersEvent"', function() {

        it('should emit "TrailersEvent" if the response has body that cannot be sent', async function(t) {
            const aContext = new ContextMock()

            const aTrailersListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof TrailersEvent, true)
                assert.strictEqual(event.response, aContext.response)
                assert.strictEqual(Object.isSealed(event.trailers), true)
                assert.strictEqual(event.trailers.hasOwnProperty('foo'), true)
            })

            aContext.target.on(kTrailersEvent, aTrailersListener)
            aContext.response.addTrailer('foo')

            await subscribe(WritingAction, aContext)
                
            assert.strictEqual(aTrailersListener.mock.callCount(), 1)
        })
    
        it('should not stop "TrailersEvent event propagation if the response send method is called', async function(t) {
            const anAbortController = new AbortController()
            const aContext = new ContextMock({ abortController: anAbortController })

            const aTrailersListenerOne = t.mock.fn((event) => event.response.send())
            const aTrailersListenerTwo = t.mock.fn((event) => event.response.send())
            aContext.response.addTrailer('foo')
    
            aContext.target.on(kTrailersEvent, aTrailersListenerOne)
            aContext.target.on(kTrailersEvent, aTrailersListenerTwo)

            await subscribe(WritingAction, aContext)
            
            assert.strictEqual(aTrailersListenerOne.mock.callCount(), 1)
            assert.strictEqual(aTrailersListenerTwo.mock.callCount(), 1)
        })

    })

    it('should remove from the response content when status code is 304', async function() {
        const aContext = new ContextMock()

        aContext.response.statusCode = 304
        aContext.response.send(Readable.from('test'))

        await subscribe(WritingAction, aContext)

        assert.strictEqual(aContext.response.body, undefined)
        assert.strictEqual(aContext.response.hasHeader('Content-Type'), false)
        assert.strictEqual(aContext.response.hasHeader('Content-Length'), false)
        assert.strictEqual(aContext.response.hasHeader('Transfer-Encoding'), false)
    })

    it('should remove from the response trailers when status code is 304', async function() {  
        const aContext = new ContextMock()

        aContext.response.statusCode = 304
        aContext.response
            .setHeader('Transfer-Encoding', 'chunked')
            .setHeader('Trailer', ['foo', 'bar'])
        aContext.response
            .addTrailer('foo')
            .addTrailer('bar')

        await subscribe(WritingAction, aContext)

        assert.strictEqual(aContext.response.trailers.length, 0)
        assert.strictEqual(aContext.response.hasHeader('Trailer'), false)
        assert.strictEqual(aContext.response.hasHeader('Transfer-Encoding'), false)
    })

    it('should set for the response "Set-Cookie" header if at least one cookie is present', async function() {
        const cookies = [ new Cookie('foo', 'bar'), new Cookie('bar', 'baz') ]
        const aContext = new ContextMock()

        aContext.response.cookies.push(...cookies)

        await subscribe(WritingAction, aContext)

        assert.deepStrictEqual(aContext.response.getHeader('Set-Cookie'), cookies)
    })

    it('should set for the response "Trailer" header if at least one trailer is present', async function() {
        const aContext = new ContextMock()

        aContext.response.addTrailer('foo')

        await subscribe(WritingAction, aContext)

        assert.deepStrictEqual(aContext.response.getHeader('Trailer'), [ 'foo' ])
    })

    it('should set for the response default "Transfer-Encoding" header to "chunked" when response has trailers', async function() {
        const aContext = new ContextMock()

        aContext.response.addTrailer('foo')

        await subscribe(WritingAction, aContext)

        assert.strictEqual(aContext.response.getHeader('Transfer-Encoding'), 'chunked')
    })

    it('should set the response default "Transfer-Encoding" header to "chunked" when body is instance of Stream', async function() {
        const aContext = new ContextMock()

        aContext.response.send(Readable.from('test'))

        await subscribe(WritingAction, aContext)

        assert.strictEqual(aContext.response.getHeader('Transfer-Encoding'), 'chunked')
    })

    it('should set the response "Content-Type" header to the response "contentType" when first one is missing', async function() {
        const aContext = new ContextMock()

        aContext.response.send({ a: 1 })

        await subscribe(WritingAction, aContext)

        assert.strictEqual(aContext.response.getHeader('Content-Type'), 'application/json; charset=utf-8')
    })

    it('should set the response "Content-Length" header to the response "contentLength" when first one is missing', async function() {
        const expected = Buffer.byteLength('foo')   
        const aContext = new ContextMock()

        aContext.response.send('foo')

        await subscribe(WritingAction, aContext)

        assert.strictEqual(aContext.response.getHeader('Content-Length'), expected)
    })

    it('should remove the response "Content-Length" header when "Transfer-Encoding" is present', async function() {
        const aContext = new ContextMock()

        aContext.response.setHeader('Content-Length', 3).setHeader('Transfer-Encoding', 'chunked')

        await subscribe(WritingAction, aContext)

        assert.strictEqual(aContext.response.hasHeader('Content-Length'), false)
    })

    it('should write the response head', async function() {
        const aContext = new ContextMock()

        aContext.response.statusCode = 404
        aContext.response.setHeader('foo', 'bar')

        await subscribe(WritingAction, aContext)

        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput[0], 'HTTP/1.1 404 Not Found')
        assert.strictEqual(anOutput[1], 'foo: bar')
    })

    it('should not write the response head if headers is already sent', async function() {
        const aContext = new ContextMock()

        await subscribe(WritingAction, aContext)

        aContext.response.statusCode = 404
        aContext.response.setHeader('foo', 'bar')

        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput[0], 'HTTP/1.1 200 OK')
    })

    it('should write the response body', async function() {
        const expected = 'foo'
        const aContext = new ContextMock()

        aContext.response.send(expected)

        await subscribe(WritingAction, aContext)

        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput.at(-1), expected)
    })

    it('should write the response stream body', async function() {
        const expected = 'foo'
        const aContext = new ContextMock()

        aContext.response.send(Readable.from(expected))

        await subscribe(WritingAction, aContext)    

        const anOutput = aContext.response.raw.end().outputData[2].data.split('\r\n')
        assert.strictEqual(anOutput.at(-1), expected)
    })

    it('should not write the response body if the request method is "HEAD"', async function() {
        const expected = 'foo'
        const aContext = new ContextMock({ method: "HEAD" })

        aContext.response.send(expected)

        await subscribe(WritingAction, aContext)

        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput.at(-1), '')
    })

    it('should not write the response body if the response writable is ended', async function() {
        const expected = 'foo'
        const aContext = new ContextMock({ method: "HEAD" })

        aContext.response.send(expected)
        aContext.response.raw.end()

        await subscribe(WritingAction, aContext)

        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput.at(-1), '')
    })

    it('should not write the response body if the response status code is 204', async function() {
        const expected = 'foo'
        const aContext = new ContextMock({ method: "HEAD" })

        aContext.response.statusCode = 204
        aContext.response.send(expected)

        await subscribe(WritingAction, aContext)

        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput.at(-1), '')
    })

    it('should write the response trailers', async function(t) {
        const aContext = new ContextMock()

        const aTrailersListener = t.mock.fn((event) => {
            event.trailers.foo = 'bar'
            event.trailers.bar = 'foo'
        })

        aContext.target.on(kTrailersEvent, aTrailersListener)
        aContext.response.addTrailer('foo').addTrailer('bar')

        await subscribe(WritingAction, aContext)
            
        const anOutput = aContext.response.raw.outputData.at(-1).data.split('\r\n').filter(key => key !== '')
        assert.strictEqual(aTrailersListener.mock.callCount(), 1)
        assert.strictEqual(anOutput.at(-2), 'foo: bar')
        assert.strictEqual(anOutput.at(-1), 'bar: foo')
    })

    it('should not write the response trailers if the response writable is already ended', async function(t) {
        const aContext = new ContextMock()
        const aResponse = aContext.response

        const aTrailersListener = t.mock.fn((event) => {
            event.trailers.foo = 'bar'
            event.trailers.bar = 'foo'
        })

        aContext.target.on(kTrailersEvent, aTrailersListener)
        aContext.response.addTrailer('foo').addTrailer('bar')
        aContext.response.raw.end()

        await subscribe(WritingAction, aContext)
            
        const anOutput = aContext.response.raw.outputData.at(-1).data.split('\r\n').filter(key => key !== '')
        assert.strictEqual(aTrailersListener.mock.callCount(), 1)
        assert.strictEqual(anOutput.at(-1), 'Content-Length: 0')
    })

    it('should end the response after writing', async function(t) {
        const aContext = new ContextMock()

        aContext.response.send('foo')

        await subscribe(WritingAction, aContext)
            
        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput.includes('content-type: text/plain; charset=utf-8'), true)
        assert.strictEqual(anOutput.includes('content-length: 3'), true)
        assert.strictEqual(anOutput.at(-1), 'foo')
        assert.strictEqual(aContext.response.raw.writableEnded, true)
    })

    it('should call callback after the response writing is ended', async function(t) {
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })
        const aCallback = t.mock.fn()

        aContext.response.send('foo')

        WritingAction(aCallback, aContext, null)
        
        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput.includes('content-type: text/plain; charset=utf-8'), true)
        assert.strictEqual(anOutput.includes('content-length: 3'), true)
        assert.strictEqual(anOutput.at(-1), 'foo')
        assert.strictEqual(aCallback.mock.callCount(), 1)
        assert.strictEqual(aContext.response.raw.writableEnded, true)
    })

    it('should immediately end the response and call callback if error occurs', async function(t) {
        const aError = new Error('oops')
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aSerializeListenerOne = t.mock.fn((event) => new Promise((resolve, reject) => setImmediate(_ => reject(aError))))
        const aSerializeListenerTwo = t.mock.fn()

        aContext.target.on(kSerializeEvent, aSerializeListenerOne)
        aContext.target.on(kSerializeEvent, aSerializeListenerTwo)

        aContext.response.setHeader('Content-Type', 'text/plain')
        aContext.features.set(kResponseBody, { a: 1 })

        await assert.rejects(_ => subscribe(WritingAction, aContext), aError)

        assert.strictEqual(aSerializeListenerOne.mock.callCount(), 1)
        assert.strictEqual(aSerializeListenerTwo.mock.callCount(), 0)
        assert.strictEqual(aContext.response.raw.writableEnded, true)
    })

    it('should call callback with error if after the serialization event the response body has invalid type', async function(t) {
        const aContext = new ContextMock()
        const aSerializeListener = t.mock.fn((event) => event.response.send({ a: 1 }))

        aContext.features.set(kResponseBody, { a: 1 })
        aContext.target.on(kSerializeEvent, aSerializeListener)

        await assert.rejects(
            _ => subscribe(WritingAction, aContext), 
            { message: `Response body can be only type of "string", "buffer" or "stream".` }
        )
        
    })

    it('should call callback with error if after the serialization event the response body is null', async function(t) {
        const aContext = new ContextMock()
        const aSerializeListener = t.mock.fn((event) => event.body = undefined)

        aContext.features.set(kResponseBody, { a: 1 })
        aContext.target.on(kSerializeEvent, aSerializeListener)

        await assert.rejects(
            _ => subscribe(WritingAction, aContext), 
            { message: `Response body can be only type of "string", "buffer" or "stream".` }
        )
        
    })

    it('should write the response and call callback with provided error', async function(t) {
        const expected = 'foo'
        const aError = new Error('oops')
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        aContext.response.send(expected)

        await assert.rejects(_ => subscribe(WritingAction, aContext, aError), aError)

        const anOutput = aContext.response.raw.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput.includes('content-type: text/plain; charset=utf-8'), true)
        assert.strictEqual(anOutput.includes('content-length: 3'), true)
        assert.strictEqual(anOutput.at(-1), expected)
    })

})

describe('"CriticalAction" test', function() {

    describe('"CriticalEvent"', function() {

        it('should emit "CriticalEvent"', async function(t) {
            const aError = new Error()
            const aContext = new ContextMock()
    
            const aCriticalListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof CriticalEvent, true)
                assert.strictEqual(event.error, aError)
                assert.strictEqual(event.target, aContext.target)
            })
    
            aContext.target.on(kCriticalEvent, aCriticalListener)

            CriticalAction(aContext, aError)

            assert.strictEqual(aCriticalListener.mock.callCount(), 1)
        })

    })

    it('should stop event propagation and throw error to the process if during "CriticalEvent" occcurs an error', function(t, done) {
        const aError = new Error('oops')
        const anAbortController = new AbortController()
        const aContext = new ContextMock({ abortController: anAbortController })

        const aCriticalListenerOne = t.mock.fn(_ => new Promise(resolve => setImmediate(resolve)))
        const aCriticalListenerTwo = t.mock.fn(_ => Promise.reject(aError))
        const aCriticalListenerThree = t.mock.fn()

        const aRunnerListener = process.rawListeners('uncaughtException')[0]
        process.off('uncaughtException', aRunnerListener).prependOnceListener('uncaughtException', (error) => {
            assert.strictEqual(error, aError)
            assert.strictEqual(aCriticalListenerOne.mock.callCount(), 1)
            assert.strictEqual(aCriticalListenerThree.mock.callCount(), 0)
            process.on('uncaughtException', aRunnerListener)
            done()
        })

        aContext.target.on(kCriticalEvent, aCriticalListenerOne)
        aContext.target.on(kCriticalEvent, aCriticalListenerTwo)
        aContext.target.on(kCriticalEvent, aCriticalListenerThree)

        CriticalAction(aContext, new Error())
    })

})

describe('"FinishAction" test', function() {

    describe('"FinishEvent"', function() {

        it('should emit "FinishEvent" on next tick if error is null', function(t, done) {
            const aContext = new ContextMock()
    
            const aFinishListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof FinishEvent, true)
                assert.strictEqual(event.target, aContext.target)
                assert.strictEqual(event.features, aContext.features)
                assert.strictEqual(event.captureRejection, true)
                assert.strictEqual(event.request instanceof HttpRequest, true)
                assert.strictEqual(event.response instanceof HttpResponse, true)
            })
    
            aContext.target.on(kFinishEvent, aFinishListener)

            FinishAction(aContext)

            setImmediate(_ => {
                assert.strictEqual(aFinishListener.mock.callCount(), 1)
                done()
            })

        })

        it('should not stop "FinishEvent" event propagation if the response send method is called', function(t, done) {
            const anAbortController = new AbortController()
            const aContext = new ContextMock({ abortController: anAbortController })

            const aFinishListenerOne = t.mock.fn((event) => event.response.send())
            const aFinishListenerTwo = t.mock.fn((event) => event.response.send())
    
            aContext.target.on(kFinishEvent, aFinishListenerOne)
            aContext.target.on(kFinishEvent, aFinishListenerTwo)

            FinishAction(aContext)

            setImmediate(_ => {
                assert.strictEqual(aFinishListenerOne.mock.callCount(), 1)
                assert.strictEqual(aFinishListenerTwo.mock.callCount(), 1)
                done()
            })

        })

    })

})

describe('"WarningAction" test', function() {

    describe('"WarningEvent"', function() {

        it('should emit "WarningEvent"', async function(t) {
            const aError = new Error()
            const aContext = new ContextMock()
    
            const aWarningListener = t.mock.fn((event) => {
                assert.strictEqual(event instanceof WarningEvent, true)
                assert.strictEqual(event.error, aError)
                assert.strictEqual(event.target, aContext.target)
            })
    
            aContext.target.on(kWarningEvent, aWarningListener)

            WarningAction(aContext, new Error())

            assert.strictEqual(aWarningListener.mock.callCount(), 1)
        })

    })

    it('should execute "CriticalAction" when during "WarningEvent" event occurs error', async function(t) {
        const aError = new Error()
        const aContext = new ContextMock()

        const aWarningListener = t.mock.fn((event) => { throw aError })
        const aCriticalListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof CriticalEvent, true)
            assert.strictEqual(event.error, aError)
            assert.strictEqual(event.target, aContext.target)
        })

        aContext.target.on(kWarningEvent, aWarningListener)
        aContext.target.on(kCriticalEvent, aCriticalListener)

        WarningAction(aContext, new Error())

        assert.strictEqual(aCriticalListener.mock.callCount(), 1)
    })

})