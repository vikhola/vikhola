const assert = require("node:assert");
const { describe, it } = require('node:test');
const { Readable } = require("node:stream");
const { HttpBody } = require('../lib/body.js')

describe('HttpBody test', function() {

    it('"type" field', function() {
        const expected = 'test'
        const aBody = new HttpBody(expected)

        assert.strictEqual(aBody.type, 'text')
    })

    describe('"content" field', function() {

        it('should return provided in construcotr payload', function() {
            const expected = 'test'
            const aBody = new HttpBody(expected)

            assert.strictEqual(aBody.content, expected)
        })

        it('should set the HttpBody "type" to "text" when body type of string', function() {
            const expected = 'test'
            const aBody = new HttpBody(expected)

            assert.strictEqual(aBody.type, 'text')
        })

        it('should set the HttpBody "type" to "bin" when body type of buffer', function() {
            const expected = Buffer.from('test')
            const aBody = new HttpBody(expected)

            assert.strictEqual(aBody.type, 'bin')
        })

        it('should set the HttpBody "type" to "stream" when body type of stream', function() {
            const expected = Readable.from('test')
            const aBody = new HttpBody(expected)

            assert.strictEqual(aBody.type, 'stream')
        })

        it('should set the HttpBody "type" to "object" when body type of object', function() {
            const expected = { foo: 'bar' }
            const aBody = new HttpBody(expected)

            assert.strictEqual(aBody.type, 'object')
        })

        it('should remove "content" and "type" when null is provided', function() {
            const expected = { foo: 'bar' }
            const aBody = new HttpBody(expected)

            aBody.content = null
            
            assert.strictEqual(aBody.type, undefined)
            assert.strictEqual(aBody.content, undefined)
        })

    })

})