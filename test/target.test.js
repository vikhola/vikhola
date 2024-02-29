const assert = require("node:assert");
const { describe, it } = require('node:test');
const { EventTarget } = require('../lib/target.js');

class EmitterEvent {

    constructor(name, serial) {
        this.name = name
        this.count = 0
        this.serial = serial
        this.stopped = false
    }

}

const sleep = (callback, ms) => new Promise(resolve => setTimeout(_ => resolve(callback()), ms))

describe('EventTarget test', function(t) {

    describe('"emit()" method', function() {

        it('should emit event and pass it as argument', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEventTarget = new EventTarget
    
            aEventTarget.on('foo', (event) => assert.strictEqual(event, aEvent))
    
            await aEventTarget.emit(aEvent)
        })
    
        it('should call event listeners concurrently if the event serial option is not defined or set to false', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEventTarget = new EventTarget
    
            aEventTarget
                .on('foo', payload => payload.count++)
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 20))
                .on('foo', payload => payload.count++)
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 2), 5))
    
            await aEventTarget.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 4)
        })

        it('should stop event propagation if the event "stopped" options set to true', async function(t) {
            const listener = t.mock.fn()
            const aEvent = new EmitterEvent('foo')
            const aEventTarget = new EventTarget
    
            aEventTarget.on('foo', _ => undefined)
            aEventTarget.on('foo', _ => aEvent.stopped = true)
            aEventTarget.on('foo', _ => undefined)
            aEventTarget.on('foo', listener)
    
            await aEventTarget.emit(aEvent)
    
            assert.strictEqual(listener.mock.callCount(), 0)
        })
    
        it('should call event listeners serial if event "serial" option set to true', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
            const aEventTarget = new EventTarget
    
            aEventTarget
                .on('foo', payload => assert.strictEqual(payload.count++, 3), { priority: 4 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 0), 10), { priority: 7 })
                .on('foo', payload => assert.strictEqual(payload.count++, 1), { priority: 6 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 2), 5), { priority: 5 })
    
            await aEventTarget.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 4)
        })
    
        it('should stop event propagation if the event has "serial" and "stopped" options set to true', async function(t) {
            const listener = t.mock.fn()
            const aEvent = new EmitterEvent('foo', true)
            const aEventTarget = new EventTarget
    
            aEventTarget.on('foo', _ => sleep(_ => aEvent.stopped = true, 10))
            aEventTarget.on('foo', listener)
    
            await aEventTarget.emit(aEvent)
    
            assert.strictEqual(listener.mock.callCount(), 0)
        })
    
        it('should call listeners from the emitter origin', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEventTargetOne = new EventTarget
            const aEventTargetTwo = new EventTarget({ origin:  aEventTargetOne })
            const aEventTargetThree = new EventTarget({ origin: aEventTargetTwo } )
    
            aEventTargetThree
                .on('foo', payload => assert.strictEqual(payload.count++, 2))
    
            aEventTargetTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 1))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 5))
    
            aEventTargetOne
                .on('foo', payload => assert.strictEqual(payload.count++, 0))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 4), 15))
    
            await aEventTargetThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 5)
        })
    
        it('should call listeners from the emitter origin with an serial options', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
            const aEventTargetOne = new EventTarget
            const aEventTargetTwo = new EventTarget({ origin:  aEventTargetOne })
            const aEventTargetThree = new EventTarget({ origin: aEventTargetTwo } )
    
            aEventTargetThree
                .on('foo', payload => assert.strictEqual(payload.count++, 4))
    
            aEventTargetTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 2))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 5))
    
            aEventTargetOne
                .on('foo', payload => assert.strictEqual(payload.count++, 0))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 1), 10))
    
            await aEventTargetThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 5)
        })
    
        it('should call listeners from the emitter origin in the order of their priority', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
    
            const aEventTargetOne = new EventTarget
            const aEventTargetTwo = new EventTarget({ origin:  aEventTargetOne })
            const aEventTargetThree = new EventTarget({ origin: aEventTargetTwo } )
    
            aEventTargetThree
                .on('foo', payload => assert.strictEqual(payload.count++, 0), { priority: 3 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 4), 10))
    
            aEventTargetTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 1), { priority: 2 })
    
            aEventTargetOne
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 2), 5), { priority: 1 })
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 10))
    
            await aEventTargetThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 5)
        })
    
        it('should not call listeners from the emitter origin if it has been removed', async function(t) {
            const listener = t.mock.fn()
            const aEvent = new EmitterEvent('foo', true)
            const aEventTargetOne = new EventTarget
            const aEventTargetTwo = new EventTarget({ origin:  aEventTargetOne })
            const aEventTargetThree = new EventTarget({ origin: aEventTargetTwo } )
    
            aEventTargetOne
                .on('foo', listener, { priority: 3 })
                .on('foo', _ => aEventTargetTwo.off('foo', listener), { priority: 1 } )
                
            aEventTargetTwo
                .on('foo', listener)
                .on('foo', _ => new Promise(resolve => setImmediate(resolve)), { priority: 2 })
    
            await aEventTargetThree.emit(aEvent)
    
            assert.strictEqual(listener.mock.callCount(), 1)
        })
    
        it('should stop event listeners calling from emitter origin if the event has "serial" and "stopped" options set to true', async function(t) {
            const aEvent = new EmitterEvent('foo', true)
            const aEventTargetOne = new EventTarget
            const aEventTargetTwo = new EventTarget({ origin:  aEventTargetOne })
            const aEventTargetThree = new EventTarget({ origin: aEventTargetTwo } )
    
            aEventTargetThree
                .on('foo', payload => assert.strictEqual(payload.count++, 4))
    
            aEventTargetTwo 
                .on('foo', payload => assert.strictEqual(payload.count++, 2))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 3), 5))
    
            aEventTargetOne
                .on('foo', payload => sleep(_ => aEvent.stopped = true, 5))
                .on('foo', payload => assert.strictEqual(payload.count++, 0))
                .on('foo', payload => sleep(_ => assert.strictEqual(payload.count++, 1), 10))
    
            await aEventTargetThree.emit(aEvent)
    
            assert.strictEqual(aEvent.count, 0)
    
        })

        it('should throw an Error when event is not type of object', async function(t) {
            const aEvent = new EmitterEvent('foo')
            const aEventTarget = new EventTarget
    
            aEventTarget.on('foo', (event) => assert.strictEqual(event, aEvent))

            await assert.rejects(_ => aEventTarget.emit('foo'), { message: 'EventTarget "event" should be type of object.' })
        })

    })

})