const assert = require('node:assert');
const { describe, it } = require('node:test');
const { Readable } = require('node:stream');
const { 
    kRequestEvent, 
    kControllerEvent, 
    kResponseEvent, 
    kWarningEvent, 
    kErrorEvent,
    kFinishEvent,
    kTrailersEvent,
    kSerializeEvent,
    kCriticalEvent,
    kParseEvent, 
} = require('../lib/const.js');
const { 
    KernelEvent, 
    RequestEvent, 
    ControllerEvent,
    ResponseEvent, 
    SerializationEvent, 
    TrailersEvent, 
    ErrorEvent, 
    WarningEvent, 
    FinishEvent, 
    CriticalEvent,
    ParseEvent,
} = require('../lib/events.js');


class ArgsMock {

    constructor({ target, error, request, response, pipeline, headers, body, trailers } = {}) {
        this.body = body
        this.error = error
        this.headers = headers
        this.trailers = trailers
        this.target = target || {}
        this.request = request || {}
        this.response = response || {}
        this.pipeline = pipeline || {}
    }
        
}

describe('KernelEvent test', function() {

    it('"name" field', function() {
        const expected = 'foo'
        const anEvent = new KernelEvent(new ArgsMock, expected)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"target" field', function() {
        const expected = Symbol('target')
        const anArgs = new ArgsMock({ target: expected })
        const anEvent = new KernelEvent(anArgs, 'foo')
        assert.strictEqual(anEvent.target, expected)
    })

    it('"serial" field', function() {
        const anEvent = new KernelEvent(new ArgsMock, 'foo')
        assert.strictEqual(anEvent.serial, true)
    })
    
    it('"request" field', function() {
        const expected = Symbol('request')
        const anArgs = new ArgsMock({ request: expected })
        const anEvent = new KernelEvent(anArgs, 'foo')
        assert.strictEqual(anEvent.request, expected)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anArgs = new ArgsMock({ response: expected })
        const anEvent = new KernelEvent(anArgs, 'foo')
        assert.strictEqual(anEvent.response, expected)
    })

    describe('"stopped"', function() {

        it('should return "false" if pipeline was not stopped', function() {
            const aPipeline = { stopped: false }
            const anArgs = new ArgsMock({ pipeline: aPipeline })
            const anEvent = new KernelEvent(anArgs, 'foo')

            assert.strictEqual(anEvent.stopped, false)
        })

        it('should return "true" if pipeline was stopped', function() {
            const aPipeline = { stopped: true }
            const anArgs = new ArgsMock({ pipeline: aPipeline })
            const anEvent = new KernelEvent(anArgs, 'foo')

            assert.strictEqual(anEvent.stopped, true)
        })

    })

})

describe('RequestEvent', function() {

    it('"name" field', function() {
        const expected = kRequestEvent
        const anEvent = new RequestEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)

    })

})

describe('ControllerEvent', function() {

    it('"name" field', function() {
        const expected = kControllerEvent
        const anEvent = new ControllerEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)

    })

})

describe('ResponseEvent', function() {

    it('"name" field', function() {
        const expected = kResponseEvent
        const anEvent = new ResponseEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)

    })

})

describe('FinishEvent', function() {

    it('"name" field', function() {
        const expected = kFinishEvent
        const anEvent = new FinishEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"stopped" field', function() {
        const aPipeline = { stopped: true }
        const anEvent = new FinishEvent(new ArgsMock({ pipeline: aPipeline }))
        assert.strictEqual(anEvent.stopped, false)
    })


})

describe('ErrorEvent test', function() {

    it('"name" field', function() {
        const expected = kErrorEvent
        const anEvent = new ErrorEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)
    })
    
    it('"error" field', function() {
        const expected = new Error()
        const anEvent = new ErrorEvent(new ArgsMock({ error: expected }))
        assert.strictEqual(anEvent.error, expected)
    })

})

describe('WarningEvent test', function() {

    it('"name" field', function() {
        const expected = kWarningEvent
        const anEvent = new WarningEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"error" field', function() {
        const expected = new Error()
        const anEvent = new WarningEvent(new ArgsMock({ error: expected }))
        assert.strictEqual(anEvent.error, expected)
    })

    it('"stopped" field', function() {
        const aPipeline = { stopped: true }
        const anEvent = new WarningEvent(new ArgsMock({ pipeline: aPipeline }))
        assert.strictEqual(anEvent.stopped, false)
    })

})

describe('ParseEvent test', function() {

    it('"name" field', function() {
        const expected = kParseEvent
        const anEvent = new ParseEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"request" field', function() {
        const expected = Symbol('request')
        const anEvent = new ParseEvent(new ArgsMock({ request: expected }))

        assert.strictEqual(anEvent.request, expected)
        anEvent.request = {}
        assert.strictEqual(anEvent.request, expected)
    })

    describe('"body" field', function() {

        it('should return raw request if no other body is defined', function() {
            const expected = Symbol('raw')
            const anEvent = new ParseEvent(new ArgsMock({ request: { raw: expected } }))

            assert.strictEqual(anEvent.body, expected)
        })

        it('should return current body content', function() {
            const expected = 'foo'
            const anEvent = new ParseEvent(new ArgsMock({ body: expected }))

            assert.strictEqual(anEvent.body, expected)
        })

        it('should set current request body', function() {
            const expected = 'foo'
            const anEvent = new ParseEvent(new ArgsMock({ body: undefined }))

            anEvent.body = expected

            assert.strictEqual(anEvent.body, expected)
        })

    })

})

describe('SerializationEvent test', function() {

    it('"name" field', function() {
        const expected = kSerializeEvent
        const anEvent = new SerializationEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"stopped" field', function() {
        const aPipeline = { stopped: true }
        const anEvent = new SerializationEvent(new ArgsMock({ pipeline: aPipeline }))
        assert.strictEqual(anEvent.stopped, false)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anEvent = new SerializationEvent(new ArgsMock({ response: expected }))

        assert.strictEqual(anEvent.response, expected)
        anEvent.response = {}
        assert.strictEqual(anEvent.response, expected)
    })

    describe('"body" field', function() {

        it('should return current body content', function() {
            const expected = 'foo'
            const anEvent = new SerializationEvent(new ArgsMock({ body: expected }))

            assert.strictEqual(anEvent.body, expected)
        })

        it('should set current request body', function() {
            const expected = 'foo'
            const anEvent = new SerializationEvent(new ArgsMock({ body: undefined }))

            anEvent.body = expected

            assert.strictEqual(anEvent.body, expected)
        })

        it('should not throw an Error when body type of string', function(t) {
            const anEvent = new SerializationEvent(new ArgsMock({ body: undefined }))
    
            assert.doesNotThrow(_ => anEvent.body = 'string')
        })

        it('should not throw an Error when body type of buffer', function(t) {
            const anEvent = new SerializationEvent(new ArgsMock({ body: undefined }))
    
            assert.doesNotThrow(_ => anEvent.body = Buffer.from('string'))
        })

        it('should not throw an Error when body type of stream', function(t) {
            const anEvent = new SerializationEvent(new ArgsMock({ body: undefined }))
    
            assert.doesNotThrow(_ => anEvent.body = Readable.from('string'))
        })

        it('should throw an Error when body has invalid type', function(t) {
            const anEvent = new SerializationEvent(new ArgsMock({ body: undefined }))
    
            assert.throws(_ => anEvent.body = { foo: 'bar' }, { message: `Response body can be only type of "string", "buffer" or "stream", received "object".` })
        })

    })

})

describe('TrailersEvent test', function() {

    it('"name" field', function() {
        const expected = kTrailersEvent
        const anEvent = new TrailersEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"stopped" field', function() {
        const aPipeline = { stopped: true }
        const anEvent = new TrailersEvent(new ArgsMock({ pipeline: aPipeline }))
        assert.strictEqual(anEvent.stopped, false)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anEvent = new TrailersEvent(new ArgsMock({ response: expected }))

        assert.strictEqual(anEvent.response, expected)
        anEvent.response = {}
        assert.strictEqual(anEvent.response, expected)
    })

    it('"trailers" field', function() {
        const trailers = { foo: 'bar' }
        const anEvent = new TrailersEvent(new ArgsMock({ trailers }))

        assert.strictEqual(anEvent.trailers, trailers)
    })

})

describe('Critical event', function() {

    it('"name" field', function() {
        const expected = kCriticalEvent
        const anEvent = new CriticalEvent(new ArgsMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"error" field', function() {
        const expected = new Error()
        const anEvent = new CriticalEvent(new ArgsMock({ error: expected }))
        assert.strictEqual(anEvent.error, expected)
    })

    it('"stopped" field', function() {
        const aPipeline = { stopped: true }
        const anEvent = new CriticalEvent(new ArgsMock({ pipeline: aPipeline }))
        assert.strictEqual(anEvent.stopped, false)
    })

})