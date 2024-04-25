const assert = require('node:assert');
const { describe, it } = require('node:test');
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
    kRequestBody,
    kResponseBody, 
} = require('../lib/const.js');
const { 
    HttpEvent, 
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
const { HttpContent } = require('../lib/content.js');


class ContextMock {

    constructor({ target, error, request, response, features, signal, trailers } = {}) {
        this.error = error
        this.signal = signal
        this.target = target || {}
        this.request = request || { raw: {} }
        this.response = response || { raw: {} }
        this.features = features
        this.trailers = trailers
    }
        
}

class FeaturesMock extends Map {

    constructor() {
        super()
    }

}

describe('HttpEvent test', function() {

    it('"name" field', function() {
        const expected = 'foo'
        const anEvent = new HttpEvent(new ContextMock, expected)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"target" field', function() {
        const expected = Symbol('target')
        const anArgs = new ContextMock({ target: expected })
        const anEvent = new HttpEvent(anArgs, 'foo')
        assert.strictEqual(anEvent.target, expected)
    })

    it('"serial" field', function() {
        const anEvent = new HttpEvent(new ContextMock, 'foo')
        assert.strictEqual(anEvent.serial, true)
    })

    it('"captureRejection" field', function() {
        const anEvent = new HttpEvent(new ContextMock, 'foo')
        assert.strictEqual(anEvent.captureRejection, undefined)
    })

    describe('"stopped"', function() {

        it('should return "false" if signal is not aborted', function() {
            const aSignal = { aborted: false }
            const anArgs = new ContextMock({ signal: aSignal })
            const anEvent = new HttpEvent(anArgs, 'foo')

            assert.strictEqual(anEvent.stopped, false)
        })

        it('should return "true" if signal is aborted', function() {
            const aSignal = { aborted: true }
            const anArgs = new ContextMock({ signal: aSignal })
            const anEvent = new HttpEvent(anArgs, 'foo')

            assert.strictEqual(anEvent.stopped, true)
        })

    })

})

describe('RequestEvent', function() {

    it('"name" field', function() {
        const expected = kRequestEvent
        const anEvent = new RequestEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"request" field', function() {
        const expected = Symbol('request')
        const anArgs = new ContextMock({ request: expected })
        const anEvent = new RequestEvent(anArgs)
        assert.strictEqual(anEvent.request, expected)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anArgs = new ContextMock({ response: expected })
        const anEvent = new RequestEvent(anArgs)
        assert.strictEqual(anEvent.response, expected)
    })

    it('"features" field', function() {
        const expected = Symbol('features')
        const anArgs = new ContextMock({ features: expected })
        const anEvent = new RequestEvent(anArgs)
        assert.strictEqual(anEvent.features, expected)
    })

})

describe('ControllerEvent', function() {

    it('"name" field', function() {
        const expected = kControllerEvent
        const anEvent = new ControllerEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"request" field', function() {
        const expected = Symbol('request')
        const anArgs = new ContextMock({ request: expected })
        const anEvent = new ControllerEvent(anArgs)
        assert.strictEqual(anEvent.request, expected)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anArgs = new ContextMock({ response: expected })
        const anEvent = new ControllerEvent(anArgs)
        assert.strictEqual(anEvent.response, expected)
    })

    it('"features" field', function() {
        const expected = Symbol('features')
        const anArgs = new ContextMock({ features: expected })
        const anEvent = new ControllerEvent(anArgs)
        assert.strictEqual(anEvent.features, expected)
    })

})

describe('ResponseEvent', function() {

    it('"name" field', function() {
        const expected = kResponseEvent
        const anEvent = new ResponseEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"request" field', function() {
        const expected = Symbol('request')
        const anArgs = new ContextMock({ request: expected })
        const anEvent = new ResponseEvent(anArgs)
        assert.strictEqual(anEvent.request, expected)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anArgs = new ContextMock({ response: expected })
        const anEvent = new ResponseEvent(anArgs)
        assert.strictEqual(anEvent.response, expected)
    })

    it('"features" field', function() {
        const expected = Symbol('features')
        const anArgs = new ContextMock({ features: expected })
        const anEvent = new ResponseEvent(anArgs)
        assert.strictEqual(anEvent.features, expected)
    })

})

describe('FinishEvent', function() {

    it('"name" field', function() {
        const expected = kFinishEvent
        const anEvent = new FinishEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"stopped" field', function() {
        const aSignal = { aborted: true }
        const anEvent = new FinishEvent(new ContextMock({ signal: aSignal }))
        assert.strictEqual(anEvent.stopped, false)
    })

    it('"request" field', function() {
        const expected = Symbol('request')
        const anArgs = new ContextMock({ request: expected })
        const anEvent = new FinishEvent(anArgs)
        assert.strictEqual(anEvent.request, expected)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anArgs = new ContextMock({ response: expected })
        const anEvent = new FinishEvent(anArgs)
        assert.strictEqual(anEvent.response, expected)
    })

    it('"features" field', function() {
        const expected = Symbol('features')
        const anArgs = new ContextMock({ features: expected })
        const anEvent = new FinishEvent(anArgs)
        assert.strictEqual(anEvent.features, expected)
    })


})

describe('ParseEvent test', function() {

    it('"name" field', function() {
        const expected = kParseEvent
        const anEvent = new ParseEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"request" field', function() {
        const expected = Symbol('request')
        const anEvent = new ParseEvent(new ContextMock({ request: expected }))
        assert.strictEqual(anEvent.request, expected)
    })

    describe('"body" field', function() {

        it('should return raw request if body is not defined', function() {
            const aFeatures = new FeaturesMock()
            const aContext = new ContextMock(new ContextMock({ features: aFeatures }))
            const anEvent = new ParseEvent(aContext)

            assert.strictEqual(anEvent.body, aContext.request.raw)
        })

        it('should return current body from the features', function() {
            const expected = 'foo'
            const aFeatures = new FeaturesMock()
            const anEvent = new ParseEvent(new ContextMock({ features: aFeatures }))

            aFeatures.set(kRequestBody, { value: expected })

            assert.strictEqual(anEvent.body, expected)
        })

        it('should set current request body', function() {
            const expected = 'foo'
            const aFeatures = new FeaturesMock()
            const anEvent = new ParseEvent(new ContextMock({ features: aFeatures }))

            anEvent.body = expected

            const aContent = aFeatures.get(kRequestBody)
            assert.strictEqual(aContent instanceof HttpContent, true)
            assert.strictEqual(aContent.value, expected)
        })

    })

})

describe('SerializationEvent test', function() {

    it('"name" field', function() {
        const expected = kSerializeEvent
        const anEvent = new SerializationEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anEvent = new SerializationEvent(new ContextMock({ response: expected }))

        assert.strictEqual(anEvent.response, expected)
    })

    describe('"body" field', function() {

        it('should return current body from the features', function() {
            const expected = 'foo'
            const aFeatures = new FeaturesMock()
            const anEvent = new SerializationEvent(new ContextMock({ features: aFeatures }))

            aFeatures.set(kResponseBody, { value: expected })

            assert.strictEqual(anEvent.body, expected)
        })

        it('should return undefined if current body is not defined', function() {
            const aFeatures = new FeaturesMock()
            const anEvent = new SerializationEvent(new ContextMock({ features: aFeatures }))

            assert.strictEqual(anEvent.body, undefined)
        })

        it('should set current request body', function() {
            const expected = 'foo'
            const aFeatures = new FeaturesMock()
            const anEvent = new SerializationEvent(new ContextMock({ features: aFeatures }))

            anEvent.body = expected

            const aContent = aFeatures.get(kResponseBody)
            assert.strictEqual(aContent instanceof HttpContent, true)
            assert.strictEqual(aContent.value, expected)
        })

    })

})

describe('TrailersEvent test', function() {

    it('"name" field', function() {
        const expected = kTrailersEvent
        const anEvent = new TrailersEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"stopped" field', function() {
        const aSignal = { aborted: true }
        const anEvent = new TrailersEvent(new ContextMock({ signal: aSignal }))
        assert.strictEqual(anEvent.stopped, false)
    })

    it('"response" field', function() {
        const expected = Symbol('response')
        const anEvent = new TrailersEvent(new ContextMock({ response: expected }))

        assert.strictEqual(anEvent.response, expected)
    })

    it('"trailers" field', function() {
        const trailers = { foo: 'bar' }
        const anEvent = new TrailersEvent(new ContextMock({ trailers }))

        assert.strictEqual(anEvent.trailers, trailers)
    })

})

describe('ErrorEvent test', function() {

    it('"name" field', function() {
        const expected = kErrorEvent
        const anEvent = new ErrorEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })
    
    it('"error" field', function() {
        const expected = new Error()
        const anEvent = new ErrorEvent(new ContextMock({ error: expected }))
        assert.strictEqual(anEvent.error, expected)
    })

})

describe('WarningEvent test', function() {

    it('"name" field', function() {
        const expected = kWarningEvent
        const anEvent = new WarningEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"error" field', function() {
        const expected = new Error()
        const anEvent = new WarningEvent(new ContextMock({ error: expected }))
        assert.strictEqual(anEvent.error, expected)
    })

    it('"stopped" field', function() {
        const aSignal = { aborted: true }
        const anEvent = new WarningEvent(new ContextMock({ signal: aSignal }))
        assert.strictEqual(anEvent.stopped, false)
    })

})

describe('Critical event', function() {

    it('"name" field', function() {
        const expected = kCriticalEvent
        const anEvent = new CriticalEvent(new ContextMock)
        assert.strictEqual(anEvent.name, expected)
    })

    it('"error" field', function() {
        const expected = new Error()
        const anEvent = new CriticalEvent(new ContextMock({ error: expected }))
        assert.strictEqual(anEvent.error, expected)
    })

    it('"stopped" field', function() {
        const aSignal = { aborted: true }
        const anEvent = new CriticalEvent(new ContextMock({ signal: aSignal }))
        assert.strictEqual(anEvent.stopped, false)
    })

})