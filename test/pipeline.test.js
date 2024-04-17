const assert = require("node:assert");
const { describe, it } = require('node:test');
const { pipeline } = require('../lib/pipeline.js');

const sleep = (callback, ms) => new Promise(resolve => setTimeout(_ => resolve(callback()), ms))

describe('pipeline test', function(t) {

    it('should call command and pass provided arguments', function(t) {
        const expected = Symbol('arg')
        const command = t.mock.fn((callback, arg) => {
            assert.strictEqual(arg, expected)
            callback()
        })

        pipeline(command)(_ => {}, expected)

        assert.strictEqual(command.mock.callCount(), 1)
    })

    it('should pass the pipeline callback to the last command', function(t) {
        const expected = Symbol('arg')
        const command = t.mock.fn(callback => callback())
        const callback = t.mock.fn()

        pipeline(command)(callback, expected)

        assert.strictEqual(callback.mock.callCount(), 1)
    })

    it('should pass the command as the callback', function(t) {
        const context = { count: 0 }
        const callback = t.mock.fn()

        pipeline([ 
            (callback, ctx) => { assert.strictEqual(ctx.count++, 0); return callback() },
            (callback, ctx) => { assert.strictEqual(ctx.count++, 1); return callback() },
            (callback, ctx) => { assert.strictEqual(ctx.count++, 2); return callback() },
            (callback, ctx) => { assert.strictEqual(ctx.count++, 3); return callback() },
            (callback, ctx) => { assert.strictEqual(ctx.count++, 4); return callback() },
        ])(callback, context)

        assert.strictEqual(context.count, 5)
    })

    it('should stop command propagation and call callback with error if it occurs', function(t, done) {
        const aError = new Error('oops')
        const command = t.mock.fn()

        pipeline([ 
            (callback) => callback(),
            (callback) => sleep(callback, 5),
            (callback) => sleep(callback, 2),
            (callback) => sleep(_ => callback(aError), 4),
            command,
        ])((error) => {
            assert.strictEqual(error, aError)
            assert.strictEqual(command.mock.callCount(), 0)
            done()
        })
        
    })

    it('should stop command propagation and call the pipeline callback when signal "aborted" options set to "true"', function(t, done) {
        const command = t.mock.fn()
        const aController = new AbortController()

        pipeline([ 
            (callback) => sleep(callback, 5),
            (callback) => sleep(_ => { aController.abort(); return callback() }, 5),
            command
        ], { signal: aController.signal })((error) => {
            assert.strictEqual(command.mock.callCount(), 0)
            done()
        })

    })

})