const assert = require("node:assert");
const { describe, it } = require('node:test');
const { HttpMessage } = require('../lib/message.js')

describe('HttpMessage test', function() {

    describe('constructor', function() {

        it('should be empty if headers is not provided', function() {
            const aMessage = new HttpMessage()
            assert.deepStrictEqual(aMessage.headers, {})
        })

        it('should assign provided headers', function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            assert.deepStrictEqual(aMessage.headers, headers)
        })

    })

    describe('"headers" property', function() {

        it(`should return all current headers`, function() {
            const headers = { 'foo': 'bar', 'bar': [ 'foo', 'baz' ] }
            const aMessage = new HttpMessage(headers)
            assert.deepStrictEqual(aMessage.headers , headers)
        })

    })

    describe('"getHeader()" method', function() {

        it(`should get header value by name`, function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            assert.equal(aMessage.getHeader('foo'), 'bar')
        })

        it(`should get header value regardless of the name case`, function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            assert.equal(aMessage.getHeader('fOo'), 'bar')
        })

        it(`should get header value by alt name when primary is not present`, function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            assert.equal(aMessage.getHeader('bar', 'foo'), 'bar')
        })

        it(`should get undefined when header is not present`, function() {
            const aMessage = new HttpMessage
            assert.deepStrictEqual(aMessage.getHeader('bar'), undefined)
        })

    })

    describe('"setHeader()" method', function() {

        it(`should set header name-value pair`, function() {
            const key = 'foo'
            const value = 'bar'
            const aMessage = new HttpMessage()
            aMessage.setHeader(key, value)
            assert.strictEqual(aMessage.getHeader(key), value)
        })
    
        it(`should be able to set header value to array`, function() {
            const key = 'foo'
            const value = ['foo=bar', 'bar=foo']
            const aMessage = new HttpMessage()
            aMessage.setHeader(key, value)
            assert.deepStrictEqual(aMessage.getHeader(key), value)
        })

        it(`should throw an Error when header name is not a string`, function() {
            const aMessage = new HttpMessage()
            assert.throws(_ => aMessage.setHeader(123), { message: `Header name "${123}" is invalid.` })
        })

        it(`should throw an Error when header name is empty string`, function() {
            const aMessage = new HttpMessage()
            assert.throws(_ => aMessage.setHeader(""), { message: `Header name "" is invalid.` })
        })

        it(`should throw an Error when header name is contain not valid chars`, function() {
            const aMessage = new HttpMessage()
            assert.throws(_ => aMessage.setHeader('foo bar'), { message: `Header name "${'foo bar'}" is invalid.` })
        })
        
    }) 

    describe(`"hasHeader()" method test`, function() {

        it(`should return "true" if header name is present `, function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            assert.strictEqual(aMessage.hasHeader('fOo'), true)
        })

        it(`should return "false" if header name is not present`, function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            assert.strictEqual(aMessage.hasHeader('bar'), false)
        })
        

    })

    describe(`"removeHeader()" method test`, function() {

        it(`should delete header if present`, function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            aMessage.removeHeader('foo')
            assert.strictEqual(aMessage.hasHeader('foo'), false)
        })

        it(`should delete header regardless of its case`, function() {
            const headers = { 'foo': 'bar' }
            const aMessage = new HttpMessage(headers)
            aMessage.removeHeader('fOo')
            assert.strictEqual(aMessage.hasHeader('foo'), false)
        })

    })

})