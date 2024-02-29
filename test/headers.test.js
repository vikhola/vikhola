const assert = require("node:assert");
const { describe, it } = require('node:test');
const { HttpHeaders } = require('../lib/headers.js')

describe('HttpHeaders test', function() {

    describe('constructor', function() {

        it('should be empty if headers is not provided', function() {
            const aHeaders = new HttpHeaders()
            assert.deepStrictEqual([ ...aHeaders ], [])
        })

        it('should assign provided headers', function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            assert.deepStrictEqual([ ...aHeaders ], [ ['foo', 'bar'] ])
        })

    })

    it('"size" option', function() {
        const headers = { 'foo': 'bar', 'bar': 'foo', 'baz': 'bar' }
        const aHeaders = new HttpHeaders(headers)
        assert.strictEqual(aHeaders.size, 3)
    })

    describe('"get()" method', function() {

        it(`should get header value by name`, function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            assert.equal(aHeaders.get('foo'), 'bar')
        })

        it(`should get header value regardless of the name case`, function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            assert.equal(aHeaders.get('fOo'), 'bar')
        })

        it(`should get header value by alt name when primary is not present`, function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            assert.equal(aHeaders.get('bar', 'foo'), 'bar')
        })

        it(`should get null when header is not present`, function() {
            const aHeaders = new HttpHeaders
            assert.deepStrictEqual(aHeaders.get('bar'), null)
        })

    })

    describe('"set()" method', function() {

        it(`should set header name-value pair`, function() {
            const header = 'foo'
            const headers = { [header]: 'bar' }
            const aHeaders = new HttpHeaders(headers)
            aHeaders.set(header, headers[header])
            assert.strictEqual(aHeaders.get(header), headers[header])
        })
    
        it(`should be able to set header value to array`, function() {
            const header = 'foo'
            const headers = { [header]: ['foo=bar', 'bar=foo'] }
            const aHeaders = new HttpHeaders(headers)
            aHeaders.set(header, headers[header])
            assert.deepStrictEqual(aHeaders.get(header), headers[header])
        })

        it(`should throw an Error when header name is not a string`, function() {
            const aHeaders = new HttpHeaders()
            assert.throws(_ => aHeaders.set(123), { message: `Header name "${123}" is invalid.` })
        })

        it(`should throw an Error when header name is empty string`, function() {
            const aHeaders = new HttpHeaders()
            assert.throws(_ => aHeaders.set(""), { message: `Header name "" is invalid.` })
        })

        it(`should throw an Error when header name is contain not valid chars`, function() {
            const aHeaders = new HttpHeaders()
            assert.throws(_ => aHeaders.set('foo bar'), { message: `Header name "${'foo bar'}" is invalid.` })
        })

        it(`should throw an Error when header value is null`, function() {
            const aHeaders = new HttpHeaders()
            assert.throws(_ => aHeaders.set("foo", null), { message: `Header "foo" value cannot be null or undefined.` })
        })

        it(`should throw an Error when header value is undefined`, function() {
            const aHeaders = new HttpHeaders()
            assert.throws(_ => aHeaders.set("foo"), { message: `Header "foo" value cannot be null or undefined.` })
        })
        
    }) 

    describe(`"has()" method test`, function() {

        it(`should return true if header name is present`, function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            aHeaders.set(headers)
            assert.strictEqual(aHeaders.has('foo'), true)
        })

        it(`should return false if header name is not present`, function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            aHeaders.set(headers)
            assert.strictEqual(aHeaders.has('bar'), false)
        })

    })

    describe(`"delete()" method test`, function() {

        it(`should delete header if present and return true`, function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            assert.strictEqual(aHeaders.delete('foo'), true)
            assert.strictEqual(aHeaders.get('foo'), null)
        })

        it(`should return false if header is not present`, function() {
            const headers = { 'foo': 'bar' }
            const aHeaders = new HttpHeaders(headers)
            assert.strictEqual(aHeaders.delete('fo1'), false)
        })

    })

    it('"names()" method', function() {
        const headers = { 'bar': '1', 'foo': '2' }
        const aHeaders = new HttpHeaders(headers)

        assert.deepStrictEqual(aHeaders.names(), [ 'bar', 'foo' ])
    })

    it('"values()" method', function() {
        const headers = { '1': 'bar', '2': 'foo' }
        const aHeaders = new HttpHeaders(headers)

        assert.deepStrictEqual(aHeaders.values(), [ 'bar', 'foo' ])
    })

    it('"clear()" method', function() {
        const headers = { 'bar': 'foo', 'foo': 'bar' }
        const aHeaders = new HttpHeaders(headers)
        aHeaders.clear()
        assert.deepStrictEqual(Object.fromEntries(aHeaders), {})
    })

    it('"[Symbol.iterator]()" method', function() {
        const headers = { 'foo': 'bar', 'bar': 'foo', 'baz': 'bar' }
        const aHeaders = new HttpHeaders(headers)
        assert.deepStrictEqual(Object.fromEntries(aHeaders), { 'foo': 'bar', 'bar': 'foo', 'baz': 'bar' })
    })

})