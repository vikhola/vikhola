const assert = require("node:assert");
const { describe, it } = require('node:test');
const { callbackify } = require('../lib/callbackify')

describe('callbackify test', function() {

    it('should return wrapper function', function(t) {
        const wrapper = callbackify(t.mock.fn())
        
        assert.strictEqual(typeof wrapper === 'function', true)
    })

    it('should pass provided arguments to the wrapped function', function(t) {
        const expected = Symbol()
        const func = t.mock.fn((arg) => assert.deepStrictEqual(arg, expected))
        const callback = t.mock.fn()

        callbackify(func)(callback, expected)

        assert.strictEqual(func.mock.callCount(), 1)
    })

    it('should immediately call callback if provided function is synchronous', function(t) {
        const func = t.mock.fn()
        const callback = t.mock.fn()

        callbackify(func)(callback)
        
        assert.strictEqual(func.mock.callCount(), 1)
        assert.strictEqual(callback.mock.callCount(), 1)
    })

    it('should immediately call callback with error if provided synchronous function throw error', function(t) {
        const aError = new Error('foo')
        const func = t.mock.fn(_ => { throw aError })
        const callback = t.mock.fn(error => assert.strictEqual(error, aError))

        callbackify(func)(callback)
        
        assert.strictEqual(func.mock.callCount(), 1)
        assert.strictEqual(callback.mock.callCount(), 1)
    })

    it('should call callback after promise resolution if provided function return promise', function(t, done) {
        const promise = new Promise(resolve => setImmediate(resolve))
        const func = t.mock.fn(_ => promise)
        const callback = t.mock.fn(error => {
            assert.strictEqual(error, null)
            assert.strictEqual(func.mock.callCount(), 1)
            done()
        })

        callbackify(func)(callback)
    })

    it('should call callback with an error after promise rejection if provided function return promise', function(t, done) {
        const aError = new Error('foo')
        const promise = new Promise((resolve, reject) => setImmediate(_ => reject(aError)))
        const func = t.mock.fn(_ => promise)
        const callback = t.mock.fn((error) => {
            assert.strictEqual(error, aError)
            assert.strictEqual(func.mock.callCount(), 1)
            done()
        })

        callbackify(func)(callback)
    })

})