const assert = require("node:assert");
const { describe, it } = require('node:test');
const { CommandPipeline } = require('../lib/pipeline.js');

class CommandMock {

    execute() {}

}

const sleep = (callback, ms) => new Promise(resolve => setTimeout(_ => resolve(callback()), ms))

describe('CommandPipeline test', function(t) {

    describe('"stop()" method', function() {

        it('should set the pipeline "stopped" option to "true"', function() {
            const aCommandPipeline = new CommandPipeline()

            aCommandPipeline.stop()

            assert.strictEqual(aCommandPipeline.stopped, true)
        })

    })

    describe('"start()" method', function() {

        it('should call command and pass provided arguments', async function(t) {
            const expected = Symbol('arg')
            const aCommand = new CommandMock()
            const aCommandPipeline = new CommandPipeline()

            const mock = t.mock.method(aCommand, 'execute', arg => assert.strictEqual(arg, expected))
    
            await aCommandPipeline.start(aCommand, expected)
    
            assert.strictEqual(mock.mock.callCount(), 1)
        })

        it('should set "stopped" option to "false" before command call', async function(t) {
            const expected = Symbol('arg')
            const aCommand = new CommandMock()
            const aCommandPipeline = new CommandPipeline()

            const mock = t.mock.method(aCommand, 'execute', arg => assert.strictEqual(arg, expected))

            aCommandPipeline.stop()
            await aCommandPipeline.start(aCommand, expected)
    
            assert.strictEqual(mock.mock.callCount(), 1)
        })

        it('should call commands sequentially if there are several of them', async function(t) {
            const context = { count: 0 }
            const aCommandPipeline = new CommandPipeline
    
            await aCommandPipeline.start([ 
                { execute: ctx => sleep(_ => assert.strictEqual(ctx.count++, 0), 5) },
                { execute: ctx => sleep(_ => assert.strictEqual(ctx.count++, 1), 2) },
                { execute: ctx => assert.strictEqual(ctx.count++, 2) },
                { execute: ctx => sleep(_ => assert.strictEqual(ctx.count++, 3), 4) },
            ], context)
    
            assert.strictEqual(context.count, 4)
        })
    
        it('should stop commands propagation if the pipeline "stopped" options set to "true"', async function(t) {
            const aCommand = new CommandMock
            const aCommandPipeline = new CommandPipeline

            const mock = t.mock.method(aCommand, 'execute')
    
            await aCommandPipeline.start([ 
                { execute: _ => sleep(_ => {}, 5) },
                { execute: _ => sleep(_ => aCommandPipeline.stop(), 2) },
                aCommand
            ])
    
            assert.strictEqual(mock.mock.callCount(), 0)
        })

    })

})