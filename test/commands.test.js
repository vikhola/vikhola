const assert = require("node:assert");
const { describe, it } = require('node:test');
const { Readable } = require("node:stream");
const { ServerResponse } = require('http')
const { STATUS_CODES } = require("node:http");
const { EventTarget } = require("../lib/target.js");
const { HttpRequest } = require("../lib/request.js");
const { HttpResponse } = require("../lib/response.js");
const { Cookie } = require("@vikhola/cookies");
const { 
    RequestEventCommand, 
    ControllerEventCommand, 
    ControllerCommand, 
    ResponseEventCommand, 
    PrepareResponseCommand, 
    WritingCommand,
    ErrorCommand,
    WarningEventCommand,
    FinishEventCommand,
    CriticalEventCommand,
    PrepareRequestCommand
} = require('../lib/commands.js');
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
    kTrailersEvent,
} = require('../lib/const')
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
const { HttpBody } = require("../lib/body.js");

class ErrorMock extends Error {

    constructor(message, status, content) {
        super(message)
        this.status = status
        this.content = content

    }

}

class FeaturesMock {

    constructor({ target, response } = {}) {
        this.target = target || new EventTarget()
        this.requestBody = new HttpBody()
        this.responseBody = new HttpBody()
        this.request = new HttpRequest(this, { method: "GET" }, {}, this.requestBody)
        this.response = response || new HttpResponse(this, new ServerResponse({ method: "GET" }), this.responseBody)
        this.pipeline = { stop: () => {} }
    }
        
}

describe('"RequestEventCommand" test', function() {

    it('should emit "RequestEvent" event', async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aCommand = new RequestEventCommand(aFeaturesMock)

        const aRequestListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof RequestEvent, true)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request instanceof HttpRequest, true)
            assert.strictEqual(event.response instanceof HttpResponse, true)
        })

        aFeaturesMock.target.on(kRequestEvent, aRequestListener)
        
        await aCommand.execute()
        assert.strictEqual(aRequestListener.mock.callCount(), 1)
    })

})

describe('PrepareRequestCommand test', function() {

    it('should emit "kernel.parse" event for the request when it has at least one listener', async function(t) {
        const expected = 'foo'
        const aFeaturesMock = new FeaturesMock()
        const aPrepareRequestCommand = new PrepareRequestCommand(aFeaturesMock)

        const aParseListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof ParseEvent, true)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request, aFeaturesMock.request)
            assert.strictEqual(event.body, aFeaturesMock.request.raw)

            event.body = (expected)
        })

        aFeaturesMock.target.on(kParseEvent, aParseListener)

        await aPrepareRequestCommand.execute()
        assert.strictEqual(aParseListener.mock.callCount(), 1)
        assert.strictEqual(aFeaturesMock.requestBody.content, expected)
    })

})

describe('"ControllerEventCommand" test', function() {

    it('should emit "ControllerEvent" event', async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aControllerEventCommand = new ControllerEventCommand(aFeaturesMock, true)

        const aControllerListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof ControllerEvent, true)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request instanceof HttpRequest, true)
            assert.strictEqual(event.response instanceof HttpResponse, true)
        })

        aFeaturesMock.target.on(kControllerEvent, aControllerListener)
        
        await aControllerEventCommand.execute()
        assert.strictEqual(aControllerListener.mock.callCount(), 1)
    })

})

describe('"ControllerCommand" test', function() {

    it('should execute controller', async function(t) {
        const aController = t.mock.fn()
        const aFeaturesMock = new FeaturesMock()
        const aControllerCommand = new ControllerCommand(aFeaturesMock, aController)

        await aControllerCommand.execute()
        assert.strictEqual(aController.mock.callCount(), 1)
    })

    it('should pass request, response as arguments and target is this', async function(t) {
        const aController = t.mock.fn(function (request, response) {
            assert.strictEqual(this instanceof EventTarget, true)
            assert.strictEqual(request instanceof HttpRequest, true)
            assert.strictEqual(response instanceof HttpResponse, true)
        })
        const aFeaturesMock = new FeaturesMock()
        const aControllerCommand = new ControllerCommand(aFeaturesMock, aController)

        await aControllerCommand.execute()
        assert.strictEqual(aController.mock.callCount(), 1)
    })

})

describe('"ResponseEventCommand" test', function() {

    it('should emit "ResponseEvent"', async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aResponseEventCommand = new ResponseEventCommand(aFeaturesMock)

        const aResponseListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof ResponseEvent, true)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request instanceof HttpRequest, true)
            assert.strictEqual(event.response instanceof HttpResponse, true)
        })

        aFeaturesMock.target.on(kResponseEvent, aResponseListener)
        
        await aResponseEventCommand.execute()
        assert.strictEqual(aResponseListener.mock.callCount(), 1)
    })

})

describe('"ErrorCommand" test', function() {

    it('should pre process error and set default payload', async function(t) {
        const aError = new Error()
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        await aErrorCommand.execute()

        assert.strictEqual(aFeaturesMock.response.body, STATUS_CODES[500])
        assert.strictEqual(aFeaturesMock.response.statusCode, 500)
    })

    it('should pre process error and set default response body that matches code', async function(t) {
        const aError = new ErrorMock('Oops', 404)
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        await aErrorCommand.execute()

        assert.strictEqual(aFeaturesMock.response.body, STATUS_CODES[404])
        assert.strictEqual(aFeaturesMock.response.statusCode, 404)
    })

    it('should pre process error and set default code if error code is not number', async function(t) {
        const aError = new ErrorMock('Oops', 'foo')
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        await aErrorCommand.execute()

        assert.strictEqual(aFeaturesMock.response.body, STATUS_CODES[500])
        assert.strictEqual(aFeaturesMock.response.statusCode, 500)
    })

    it('should pre process error and set response custom response body if last one is present', async function(t) {
        const aError = new ErrorMock('Oops', 404, 'foo')
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        await aErrorCommand.execute()

        assert.strictEqual(aFeaturesMock.response.body, 'foo')
        assert.strictEqual(aFeaturesMock.response.statusCode, 404)
    })

    it('should set an Error "code" for response status and an Error "content" for response body during default error process', async function(t) {
        const aError = new Error()
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        await aErrorCommand.execute()

        assert.strictEqual(aFeaturesMock.response.body, STATUS_CODES[500])
        assert.strictEqual(aFeaturesMock.response.statusCode, 500)
    })

    it('should emit "kernel.error" if it has at least one listener', async function(t) {
        const aError = new Error()
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        const aErrorListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof ErrorEvent, true)
            assert.strictEqual(event.error, aError)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request instanceof HttpRequest, true)
            assert.strictEqual(event.response instanceof HttpResponse, true)
        })

        aFeaturesMock.target.on(kErrorEvent, aErrorListener)
        
        await aErrorCommand.execute()
        assert.strictEqual(aErrorListener.mock.callCount(), 1)
    })

    it('should pre process error before "kernel.error" event dispatch', async function(t) {
        const aError = new Error()
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        const aErrorListener = t.mock.fn((event) => {
            assert.strictEqual(event.response.body, STATUS_CODES[500])
            assert.strictEqual(event.response.statusCode, 500)
        })

        aFeaturesMock.target.on(kErrorEvent, aErrorListener)
        
        await aErrorCommand.execute()
        assert.strictEqual(aErrorListener.mock.callCount(), 1)
    })

    it('should catch error from the "kernel.event" event, process it and then throw it', async function(t) {
        const aError = new Error()
        const aListenerError = new Error()
        const aFeaturesMock = new FeaturesMock()
        const aErrorCommand = new ErrorCommand(aFeaturesMock, aError)

        const aErrorListener = t.mock.fn((event) => { throw aError })

        aFeaturesMock.target.on(kErrorEvent, aErrorListener)

        await assert.rejects(_ => aErrorCommand.execute(),  aListenerError)
        assert.strictEqual(aFeaturesMock.response.body, STATUS_CODES[500])
        assert.strictEqual(aFeaturesMock.response.statusCode, 500)
    })

})

describe('PrepareResponseCommand test', function() {

    it('should remove from the response content when status code is 304', async function() {
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.statusCode = 304
        aFeaturesMock.response.send(Readable.from('test'))

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.body, undefined)
        assert.strictEqual(aFeaturesMock.response.headers.has('Content-Type'), false)
        assert.strictEqual(aFeaturesMock.response.headers.has('Content-Length'), false)
        assert.strictEqual(aFeaturesMock.response.headers.has('Transfer-Encoding'), false)
    })

    it('should remove from the response trailers when status code is 304', async function() {  
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.statusCode = 304
        aFeaturesMock.response.headers
            .set('Transfer-Encoding', 'chunked')
            .set('Trailer', ['foo', 'bar'])
        aFeaturesMock.response.trailers
            .add('foo')
            .add('bar')

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.trailers.size, 0)
        assert.strictEqual(aFeaturesMock.response.headers.has('Trailer'), false)
        assert.strictEqual(aFeaturesMock.response.headers.has('Transfer-Encoding'), false)
    })

    it('should set for the response "Set-Cookie" header if at least one cookie is present', async function() {
        const cookies = [ new Cookie('foo', 'bar'), new Cookie('bar', 'baz') ]
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.cookies.push(...cookies)

        await aPrepareResponseCommand.execute()
        assert.deepStrictEqual(aFeaturesMock.response.headers.get('Set-Cookie'), cookies)
    })

    it('should set for the response "Trailer" header if at least one trailer is present', async function() {
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.trailers.add('foo', 'bar')

        await aPrepareResponseCommand.execute()
        assert.deepStrictEqual(aFeaturesMock.response.headers.get('Trailer'), [ 'foo' ])
    })

    it('should set for the response default "Transfer-Encoding" header to "chunked" when response has trailers', async function() {
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.trailers.add('foo', 'bar')

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.headers.get('Transfer-Encoding'), 'chunked')
    })

    it('should set for the response default "contentType" field as "Content-Type" header before serialization when it is missing', async function() {
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.send({ a: 1 })

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.headers.get('Content-Type'), 'application/json; charset=utf-8')
    })

    it('should serialize JSON body when "kernel.serialize" event does not have any listeners', async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.send({ a: 1 })

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.body, JSON.stringify({ a: 1 }))
    })

    it('should emit "kernel.serialize" event for the JSON body when it has at least one listener', async function(t) {
        const expected = { a: 1 }
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.send(expected)

        const aSerializationListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof SerializationEvent, true)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.response, aFeaturesMock.response)
            assert.strictEqual(event.body, expected)

            event.body = JSON.stringify(event.body)
        })

        aFeaturesMock.target.on(kSerializeEvent, aSerializationListener)

        await aPrepareResponseCommand.execute()

        assert.strictEqual(aSerializationListener.mock.callCount(), 1)
        assert.strictEqual(aFeaturesMock.responseBody.content, JSON.stringify(expected))
    })

    it('should set the response default "Transfer-Encoding" header to "chunked" when body is instance of Stream', async function() {
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.send(Readable.from('test'))

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.headers.get('Transfer-Encoding'), 'chunked')
    })

    it('should set the response default "Content-Length" header to buffer byte length when actual length is not match', async function() {
        const expected = Buffer.byteLength('foo')   
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.contentLength = 20
        aFeaturesMock.response.send('foo')

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.headers.get('Content-Length'), expected)
    })

    it('should remove the response "Content-Length" header when "Transfer-Encoding" is present', async function() {
        const aFeaturesMock = new FeaturesMock()
        const aPrepareResponseCommand = new PrepareResponseCommand(aFeaturesMock)

        aFeaturesMock.response.headers.set('Content-Length', 3).set('Transfer-Encoding', 'chunked')

        await aPrepareResponseCommand.execute()
        assert.strictEqual(aFeaturesMock.response.headers.has('Content-Length'), false)
    })

})

describe('"WritingCommand"', function() {

    it(`should not be executed if headers is already sent`, async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aWritingCommand = new WritingCommand(aFeaturesMock)
        const aResponse = aFeaturesMock.response
        const aRawResponse = aResponse.raw
        
        aRawResponse.writeHead(404)
        aResponse.statusCode = 500
        aResponse.headers.set('foo', 'bar')

        await aWritingCommand.execute()

        const anOutput = aRawResponse.end().outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput[0], 'HTTP/1.1 404 Not Found')
    })

    it(`should not be executed if response is already ended`, async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aWritingCommand = new WritingCommand(aFeaturesMock)
        const aResponse = aFeaturesMock.response
        const aRawResponse = aResponse.raw
        
        aRawResponse.end()
        aResponse.statusCode = 500
        aResponse.headers.set('foo', 'bar')

        await aWritingCommand.execute()

        const anOutput = aRawResponse.outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput[0], 'HTTP/1.1 200 OK')
    })

    it('should write the response head', async function() {
        const aFeaturesMock = new FeaturesMock()
        const aWritingCommand = new WritingCommand(aFeaturesMock)
        const aResponse = aFeaturesMock.response
        const aRawResponse = aResponse.raw

        aResponse.statusCode = 404
        aResponse.headers.set('foo', 'bar')

        await aWritingCommand.execute()

        const anOutput = aRawResponse.end().outputData[0].data.split('\r\n')
        assert.strictEqual(anOutput[0], 'HTTP/1.1 404 Not Found')
        assert.strictEqual(anOutput[1], 'foo: bar')
    })

    it('should write the response body', async function() {
        const expected = 'foo'
        const aFeaturesMock = new FeaturesMock()
        const aWritingCommand = new WritingCommand(aFeaturesMock)
        const aResponse = aFeaturesMock.response
        const aRawResponse = aResponse.raw

        aResponse.send(expected)

        await aWritingCommand.execute()

        const anOutput = aRawResponse.end().outputData[2].data.split('\r\n')
        assert.strictEqual(anOutput.at(-1), expected)
    })

    it('should write the response stream body', async function() {
        const expected = 'foo'
        const aFeaturesMock = new FeaturesMock()
        const aWritingCommand = new WritingCommand(aFeaturesMock)
        const aResponse = aFeaturesMock.response
        const aRawResponse = aResponse.raw

        aResponse.send(Readable.from(expected))

        await aWritingCommand.execute()

        const anOutput = aRawResponse.end().outputData[2].data.split('\r\n')
        assert.strictEqual(anOutput.at(-1), expected)
    })

    it('should emit "kernel.trailers" when the response has trailers and write it', async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aWritingCommand = new WritingCommand(aFeaturesMock)
        const aResponse = aFeaturesMock.response
        const aRawResponse = aResponse.raw

        aResponse.trailers.add('foo').add('bar')

        const aTrailersListener = t.mock.fn(event => {
            assert.strictEqual(event instanceof TrailersEvent, true)
            assert.strictEqual(event.response, aFeaturesMock.response)
            assert.strictEqual(Object.isSealed(event.trailers), true)
            event.trailers.foo = 'bar'
            event.trailers.bar = 'foo'
        })

        aFeaturesMock.target.on(kTrailersEvent, aTrailersListener)

        await aWritingCommand.execute()

        const anOutput = aRawResponse.end().outputData.at(-1).data.split('\r\n').filter(key => key !== '')
        assert.strictEqual(aTrailersListener.mock.callCount(), 1)
        assert.strictEqual(anOutput.at(-2), 'foo: bar')
        assert.strictEqual(anOutput.at(-1), 'bar: foo')
    })

})

describe('"WarningEventCommand" test', function() {

    it('should emit "WarningEvent"', async function(t) {
        const aError = new Error()
        const aFeaturesMock = new FeaturesMock()
        const aWarningEventCommand = new WarningEventCommand(aFeaturesMock, aError)

        const aWarningListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof WarningEvent, true)
            assert.strictEqual(event.error, aError)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request instanceof HttpRequest, true)
            assert.strictEqual(event.response instanceof HttpResponse, true)
        })

        aFeaturesMock.target.on(kWarningEvent, aWarningListener)
        
        await aWarningEventCommand.execute()
        assert.strictEqual(aWarningListener.mock.callCount(), 1)
    })

})

describe('"FinishEventCommand" test', function() {

    it('should emit "FinishEvent"', async function(t) {
        const aFeaturesMock = new FeaturesMock()
        const aFinishEventCommand = new FinishEventCommand(aFeaturesMock)

        const aFinishListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof FinishEvent, true)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request instanceof HttpRequest, true)
            assert.strictEqual(event.response instanceof HttpResponse, true)
        })

        aFeaturesMock.target.on(kFinishEvent, aFinishListener)
        
        await aFinishEventCommand.execute()
        assert.strictEqual(aFinishListener.mock.callCount(), 1)
    })

})

describe('"CriticalEventCommand" test', function() {

    it('should emit "CriticalEvent"', async function(t) {
        const aError = new Error()
        const aFeaturesMock = new FeaturesMock()
        const aCriticalEventCommand = new CriticalEventCommand(aFeaturesMock, aError)

        const aCriticalListener = t.mock.fn((event) => {
            assert.strictEqual(event instanceof CriticalEvent, true)
            assert.strictEqual(event.error, aError)
            assert.strictEqual(event.target, aFeaturesMock.target)
            assert.strictEqual(event.request instanceof HttpRequest, true)
            assert.strictEqual(event.response instanceof HttpResponse, true)
        })

        aFeaturesMock.target.on(kCriticalEvent, aCriticalListener)
        
        await aCriticalEventCommand.execute()
        assert.strictEqual(aCriticalListener.mock.callCount(), 1)
    })

})
