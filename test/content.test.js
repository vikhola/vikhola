const assert = require("node:assert");
const { describe, it } = require('node:test');
const { Readable } = require("node:stream");
const { HttpContent } = require('../lib/content.js')

describe('HttpContent test', function() {

    describe('"type" field', function() {

        it('should set the "type" to "text" when body type of string', function() {
            const value = 'test'
            const aBody = new HttpContent(value)

            assert.strictEqual(aBody.type, 'text')
        })

        it('should set the "type" to "html" when body type of html string', function() {
            const value = '<a href="test"></a>'
            const aBody = new HttpContent(value)

            assert.strictEqual(aBody.type, 'html')
        })

        it('should set the "type" to "bin" when body type of buffer', function() {
            const value = Buffer.from('test')
            const aBody = new HttpContent(value)

            assert.strictEqual(aBody.type, 'bin')
        })

        it('should set the "type" to "stream" when body type of stream', function() {
            const value = Readable.from('test')
            const aBody = new HttpContent(value)

            assert.strictEqual(aBody.type, 'stream')
        })

        it('should set the "type" actual value type when it is not Buffer, Stream or String', function() {
            const value = { foo: 'bar' }
            const aBody = new HttpContent(value)

            assert.strictEqual(aBody.type, 'object')
        })

    })

    describe('"value" field', function() {

        it('should return provided in constructor payload', function() {
            const value = 'test'
            const aBody = new HttpContent(value)

            assert.strictEqual(aBody.value, value)
        })

    })

})