const assert = require("node:assert");
const { describe, it } = require('node:test');
const { Emitter, NewListenerEvent, RemoveListenerEvent } = require('../lib/emitter.js');

class EmitterEvent {

    constructor(name, serial, capture) {
        this.name = name
        this.count = 0
        this.serial = serial
        this.stopped = false
        this.captureRejection = capture
    }

}

const sleep = (callback, ms) => new Promise(resolve => setTimeout(_ => resolve(callback()), ms))

describe('NewListenerEvent', function() {

    it('"name" field', function() {
        const expected = 'newListener'
        const anEvent = new NewListenerEvent()
        assert.strictEqual(anEvent.name, expected)
    })

    it('"event" field', function() {
        const expected = 'foo'
        const anEvent = new NewListenerEvent(null, expected)
        assert.strictEqual(anEvent.event, expected)
    })

    it('"listener" field', function() {
        const expected = () => {}
        const anEvent = new NewListenerEvent(null, 'foo', expected)

        assert.strictEqual(anEvent.listener, expected)
    })

    it('"options" field', function() {
        const expected = { priority: 10 }
        const anEvent = new NewListenerEvent(null, 'foo', () => {}, expected)

        assert.strictEqual(anEvent.options, expected)
    })

})

describe('RemoveListenerEvent', function() {

    it('"name" field', function() {
        const expected = 'removeListener'
        const anEvent = new RemoveListenerEvent()
        assert.strictEqual(anEvent.name, expected)
    })

    it('"event" field', function() {
        const expected = 'foo'
        const anEvent = new RemoveListenerEvent(null, expected)
        assert.strictEqual(anEvent.event, expected)
    })

    it('"listener" field', function() {
        const expected = () => {}
        const anEvent = new RemoveListenerEvent(null, 'foo', expected)

        assert.strictEqual(anEvent.listener, expected)
    })

})

describe('Emitter test', function(t) {

    describe('"emit()" method', function() {

        it('should emit event and pass it as argument', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEmitter = new Emitter
    
            aEmitter.on('foo', (event) => assert.strictEqual(event, aEvent))
    
            await aEmitter.emit(aEvent)
        })

        it('should emit "NewListenerEvent" during "newListener" event', function(t, done) {
            const aEvent = new EmitterEvent('foo')
            const aEmitter = new Emitter
            const aListener = t.mock.fn()
            const aOptions = { priority: 10 }

            aEmitter.on('newListener', (event) => {
                assert.strictEqual(event instanceof NewListenerEvent, true)
                assert.strictEqual(event.name, 'newListener')
                assert.strictEqual(event.event, 'foo')
                assert.strictEqual(event.listener, aListener)
                assert.deepStrictEqual(event.options, aOptions)
                done()
            })
            aEmitter.on('foo', aListener, aOptions)

            aEmitter.emit(aEvent)
        })

        it('should emit "RemoveListenerEvent" during "removeListener" event', function(t, done) {
            const aEvent = new EmitterEvent('foo')
            const aEmitter = new Emitter
            const aListener = t.mock.fn()
            const aOptions = { priority: 10 }
    
            aEmitter.on('removeListener', (event) => {
                assert.strictEqual(event instanceof RemoveListenerEvent, true)
                assert.strictEqual(event.name, 'removeListener')
                assert.strictEqual(event.event, 'foo')
                assert.strictEqual(event.listener, aListener)
                done()
            })
            aEmitter.on('foo', aListener, aOptions)
            aEmitter.off('foo', aListener)

            aEmitter.emit(aEvent)
        })
    
        it('should call event listeners concurrently if the event serial option is not defined or set to false', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEmitter = new Emitter
    
            aEmitter
                .on('foo', payload => payload.count++)
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 20))
                .on('foo', payload => payload.count++)
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 2), 5))
    
            await aEmitter.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 4)
        })

        it('should stop event parallel propagation if the event "stopped" options set to true', async function(t) {
            const listener = t.mock.fn()
            const aEvent = new EmitterEvent('foo')
            const aEmitter = new Emitter
    
            aEmitter.on('foo', _ => undefined)
            aEmitter.on('foo', _ => aEvent.stopped = true)
            aEmitter.on('foo', _ => undefined)
            aEmitter.on('foo', listener)
    
            await aEmitter.emit(aEvent)
    
            assert.strictEqual(listener.mock.callCount(), 0)
        })
    
        it('should call event listeners serial if event "serial" option set to true', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
            const aEmitter = new Emitter
    
            aEmitter
                .on('foo', payload => assert.strictEqual(payload.count++, 3), { priority: 4 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 0), 10), { priority: 7 })
                .on('foo', payload => assert.strictEqual(payload.count++, 1), { priority: 6 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 2), 5), { priority: 5 })
    
            await aEmitter.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 4)
        })
    
        it('should stop event propagation if the event has "serial" and "stopped" options set to true', async function(t) {
            const listener = t.mock.fn()
            const aEvent = new EmitterEvent('foo', true)
            const aEmitter = new Emitter
    
            aEmitter.on('foo', _ => sleep(_ => aEvent.stopped = true, 10))
            aEmitter.on('foo', listener)
    
            await aEmitter.emit(aEvent)
    
            assert.strictEqual(listener.mock.callCount(), 0)
        })
    
        it('should call listeners from the emitter origin', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEmitterOne = new Emitter
            const aEmitterTwo = new Emitter({ origin:  aEmitterOne })
            const aEmitterThree = new Emitter({ origin: aEmitterTwo } )
    
            aEmitterThree
                .on('foo', payload => assert.strictEqual(payload.count++, 2))
    
            aEmitterTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 1))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 5))
    
            aEmitterOne
                .on('foo', payload => assert.strictEqual(payload.count++, 0))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 4), 15))
    
            await aEmitterThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 5)
        })
    
        it('should call listeners from the emitter origin with an serial options', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
            const aEmitterOne = new Emitter
            const aEmitterTwo = new Emitter({ origin:  aEmitterOne })
            const aEmitterThree = new Emitter({ origin: aEmitterTwo } )
    
            aEmitterThree
                .on('foo', payload => assert.strictEqual(payload.count++, 4))
    
            aEmitterTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 2))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 5))
    
            aEmitterOne
                .on('foo', payload => assert.strictEqual(payload.count++, 0))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 1), 10))
    
            await aEmitterThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 5)
        })
    
        it('should call listeners from the emitter origin in the order of their priority', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
    
            const aEmitterOne = new Emitter
            const aEmitterTwo = new Emitter({ origin:  aEmitterOne })
            const aEmitterThree = new Emitter({ origin: aEmitterTwo } )
    
            aEmitterThree
                .on('foo', payload => assert.strictEqual(payload.count++, 0), { priority: 3 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 4), 10))
    
            aEmitterTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 1), { priority: 2 })
    
            aEmitterOne
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 2), 5), { priority: 1 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 10))
    
            await aEmitterThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 5)
        })
    
        it('should stop event listeners calling from emitter origin if the event has "serial" and "stopped" options set to true', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
            const aEmitterOne = new Emitter
            const aEmitterTwo = new Emitter({ origin:  aEmitterOne })
            const aEmitterThree = new Emitter({ origin: aEmitterTwo } )
    
            aEmitterThree
                .on('foo', payload => assert.strictEqual(payload.count++, 4))
    
            aEmitterTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 2))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 5))
    
            aEmitterOne
                .on('foo', payload => sleep(_ => aEvent.stopped = true, 5))
                .on('foo', payload => assert.strictEqual(payload.count++, 0))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 1), 10))
    
            await aEmitterThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 0)
    
        })

        it('should throw an Error when event is not type of object', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEmitter = new Emitter
    
            aEmitter.on('foo', (event) => assert.strictEqual(event, aEvent))

            assert.throws(_ => aEmitter.emit('foo'), { message: 'Emitter "event" should be type of object.' })
        })

        it('should throw a error occurred during listeners propagation from the synchronous listeners', async function(t) {
            const aError = new Error('oops')
            const aEvent = new EmitterEvent('foo', true)
            const aEmitter = new Emitter

            const aListenerOne = t.mock.fn(_ => {})
            const aListenerTwo = t.mock.fn(_ => { throw aError })
    
            aEmitter.on('foo', aListenerOne)
            aEmitter.on('foo', aListenerTwo)

            assert.throws(_ => aEmitter.emit(aEvent), aError)
        })

        it('should reject a error occurred during listeners propagation if some of listeners was is asynchronous', async function(t) {
            const aError = new Error('oops')
            const aEvent = new EmitterEvent('foo', true)
            const aEmitter = new Emitter

            const aListenerOne = t.mock.fn(_ => new Promise(resolve => setImmediate(resolve)))
            const aListenerTwo = t.mock.fn(_ => { throw aError })
    
            aEmitter.on('foo', aListenerOne)
            aEmitter.on('foo', aListenerTwo)

            assert.rejects(_ => aEmitter.emit(aEvent), aError)
        })

        it('should stop parallel listeners propagation if an synchronous error occurs', async function(t) {
            const aError = new Error('oops')
            const aEvent = new EmitterEvent('foo')
            const aEmitter = new Emitter

            const aListenerOne = t.mock.fn(_ => new Promise(resolve => setImmediate(resolve)))
            const aListenerTwo = t.mock.fn(_ => { throw aError })
            const aListenerThree = t.mock.fn()
    
            aEmitter.on('foo', aListenerOne)
            aEmitter.on('foo', aListenerTwo)
            aEmitter.on('foo', aListenerThree)

            await assert.rejects(_ => aEmitter.emit(aEvent), aError)
            assert.strictEqual(aListenerThree.mock.callCount(), 0)
        })

        it('should capture synchronous error and execute default handler if event "captureRejection" is set to true', function(t, done) {
            const aError = new Error('oops')
            const aEvent = new EmitterEvent('foo', true, true)
            const aEmitter = new Emitter

            const aListenerOne = t.mock.fn(_ => {})
            const aListenerTwo = t.mock.fn(_ => { throw aError })
            const aErrorListener = t.mock.fn(event => {
                assert.strictEqual(event.error, aError)
                done()
            })
    
            aEmitter.on('foo', aListenerOne)
            aEmitter.on('foo', aListenerTwo)
            aEmitter.on('error', aErrorListener)

            aEmitter.emit(aEvent)
        })

        it('should capture asynchronous error and execute default handler if event "captureRejection" is set to true', function(t, done) {
            const aError = new Error('oops')
            const aEvent = new EmitterEvent('foo', true, true)
            const aEmitter = new Emitter

            const aListenerOne = t.mock.fn(_ => new Promise(resolve => setImmediate(resolve)))
            const aListenerTwo = t.mock.fn(_ => { throw aError })
            const aErrorListener = t.mock.fn(event => {
                assert.strictEqual(event.error, aError)
                done()
            })
    
            aEmitter.on('foo', aListenerOne)
            aEmitter.on('foo', aListenerTwo)
            aEmitter.on('error', aErrorListener)

            aEmitter.emit(aEvent)
        })

    })

})
