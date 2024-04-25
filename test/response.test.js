const assert = require("node:assert");
const { describe, it } = require('node:test');
const { Readable } = require("node:stream");
const { ServerResponse } = require('http')
const { HttpContent } = require("../lib/content.js");
const { HttpResponse } = require("../lib/response.js");
const { kResponseBody } = require("../lib/const.js");

class FeaturesMock extends Map {

    constructor(pipeline) {
        super()
    }

    remove(name) {
        this.delete(name)
    }

}

describe('HttpResponse test', function() {

    it('"cookies" property', async function() {
        const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

        assert.deepEqual(aResponse.cookies, [])
    })

    describe('"trailers" property', function() {

        it(`should return all current trailers`, function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }))
            assert.deepStrictEqual(aResponse.trailers, [])
        })

    })

    describe('"body", property', function() {

        it('should return the response body from the featrues', function() {
            const expected = 'test'
            const aFeatures = new FeaturesMock()
            const aResponse = new HttpResponse(aFeatures, new ServerResponse({ method: 'GET' }))
            
            aFeatures.set(kResponseBody, { value: expected })
    
            assert.strictEqual(aResponse.body, expected)
        })

    })

    describe('"statusCode" property',  function() {

        it('should be able to set and get statusCode', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            aResponse.statusCode = 204
            assert.strictEqual(aResponse.statusCode, 204)
        })

        it('should throw when status code is not integer', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            assert.throws(_ => aResponse.statusCode = '123', {message: `Response "statusCode" should be number.`})
        })

        it('should throw when the status code is less than 100', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            assert.throws(_ => aResponse.statusCode = 99)
        })

        it('should throw when the status code is greater than 999', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            assert.throws(_ => aResponse.statusCode = 1000, { message: `Response "statusCode" should be between 100 and 999.` })
        })

    })

    describe('"contentType" property', function() {

        it('should get "Content-Type" header', function() {
            const expected = 'application/json'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.setHeader('Content-type', expected).contentType = expected

            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should set the "Content-Type" header', function() {
            const expected = 'application/json'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.contentType = expected

            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should get default "Content-Type" value when header is not present', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send('foo')
            assert.strictEqual(aResponse.contentType, "text/plain; charset=utf-8")
        })

        it('should return "text/plain; charset=utf-8" as default "Content-Type" when the response body is "text" string', function() {
            const expected = 'text/plain; charset=utf-8'  
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send('foo')
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "text/html; charset=utf-8" as default "Content-Type" when the response body is "html" string', function() {
            const expected = 'text/html; charset=utf-8'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send('<a href="test"></a>')
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "application/octet-stream" as default "Content-Type" when the response body is buffer', function() {
            const expected = 'application/octet-stream'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send(Buffer.from('123'))
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "application/octet-stream" as default "Content-Type" when the response body is "stream"', function() {
            const expected = 'application/octet-stream'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send(Readable.from('test'))
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "application/json" as default "Content-Type" when the response body is "json"', function() {
            const expected = 'application/json; charset=utf-8'   
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send({ a: 1 })
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "text/html; charset=utf-8" as default "Content-Type" when the response body type is not match any other', function() {
            const expected = 'text/html; charset=utf-8'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send('<a href="test"></a>')
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should remove "Content-Type" header', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.setHeader('Content-Type', 'application/octet-stream')
            aResponse.contentType = null

            assert.strictEqual(aResponse.hasHeader('Content-Type'), false)
        })

    })

    describe('"contentLength" property', function() {

        it('should be able to set and get "Content-Length" header', function() {
            const expected = 200
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            aResponse.contentLength = expected

            assert.strictEqual(aResponse.contentLength, expected)
        })

        it('should remove "Content-Length" header', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            aResponse.setHeader('Content-Length', 20)
            aResponse.contentLength = null

            assert.strictEqual(aResponse.hasHeader('Content-Length'), false)
        })

        it('should throw an Error when "Content-Length" headers is not type of number', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            assert.throws(_ => aResponse.contentLength = 'bar', { message: 'Response "Content-Length" should be number.' })
        })

    })

    describe('"addTrailer()" method', function() {

        it(`should add trailer`, function() {
            const trailer = 'foo'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            assert.strictEqual(aResponse.addTrailer(trailer), aResponse)
            assert.deepStrictEqual(aResponse.trailers, [ trailer ])
        })
    
        it(`should not add trailer if it already present`, function() {
            const trailer = 'foo'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)

            aResponse.addTrailer(trailer)
            assert.deepStrictEqual(aResponse.trailers, [ trailer ])
        })

        it(`should throw an Error when trailer name is not a string`, function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)
            assert.throws(_ => aResponse.addTrailer(123), { message: `Trailer name "${123}" is invalid.` })
        })

        it(`should throw an Error when trailer name is empty string`, function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)
            assert.throws(_ => aResponse.addTrailer(""), { message: `Trailer name "" is invalid.` })
        })

        it(`should throw an Error when trailer name is contain invalid chars`, function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)
            assert.throws(_ => aResponse.addTrailer('foo bar'), { message: `Trailer name "${'foo bar'}" is invalid.` })
        })

        it(`should throw an Error when trailer name is invalid`, function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)
            assert.throws(_ => aResponse.addTrailer('Content-Type'), { message: `Trailer name "${'Content-Type'}" is invalid.` })
        })

        it(`should throw an Error when headers is already sent`, function() {
            const response = new ServerResponse({ method: 'GET' })
            const aResponse = new HttpResponse(new FeaturesMock(), response, new AbortController)
            response.flushHeaders()
            assert.throws(_ => aResponse.addTrailer('Content-Type'), { message: `Trailer header is already sent.` })
        })
        
    }) 

    describe(`"hasTrailer()" method test`, function() {

        it(`should return true if trailer name is present`, function() {
            const trailer = 'foo'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)
            aResponse.addTrailer(trailer)
            assert.strictEqual(aResponse.hasTrailer('foo'), true)
        })

        it(`should return false if trailer name is not present`, function() {
            const trailer = 'foo'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)
            assert.strictEqual(aResponse.hasTrailer(trailer), false)
        })

    })

    describe(`"removeTrailer()" method test`, function() {

        it(`should remove trailer`, function() {
            const trailer = 'foo'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new AbortController)
            aResponse.addTrailer(trailer)
            assert.strictEqual(aResponse.removeTrailer('foo'), aResponse)
            assert.strictEqual(aResponse.hasTrailer('foo'), false)
        })

        it(`should throw an Error when headers is already sent`, function() {
            const response = new ServerResponse({ method: 'GET' })
            const aResponse = new HttpResponse(new FeaturesMock(), response, new AbortController)
            response.flushHeaders()
            assert.throws(_ => aResponse.removeTrailer('foo'), { message: `Trailer header is already sent.` })
        })

    })

    describe('"send()" method', function() {

        it('should call AbortController abort method', function(t) {
            const aAbortControllerMock = new AbortController()
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), aAbortControllerMock)

            aResponse.send()

            assert.strictEqual(aAbortControllerMock.signal.aborted, true)
        })

        it('should set the features response body', function() {
            const expected = 'test'
            const aFeatures = new FeaturesMock()
            const aResponse = new HttpResponse(aFeatures, new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.send(expected)

            const aContent = aFeatures.get(kResponseBody)
            assert.strictEqual(aContent instanceof HttpContent, true)
            assert.strictEqual(aContent.value, expected)
        })

        it('should remove body, type and all it headers when body is null', function() {
            const aFeatures = new FeaturesMock()
            const aResponse = new HttpResponse(aFeatures, new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.setHeader('Transfer-Encoding', 'chunked')
            aResponse.contentType = 'text/html; charset=utf-8'
            aResponse.contentLength = Buffer.byteLength('<a href="test"></a>')
            aResponse.send('<a href="test"></a>')
            aResponse.send(null)
            
            assert.strictEqual(aResponse.body, undefined)
            assert.strictEqual(aResponse.contentType, undefined)
            assert.strictEqual(aResponse.contentLength, undefined)
            assert.strictEqual(aFeatures.has(kResponseBody), false)
            assert.strictEqual(aResponse.hasHeader('Transfer-Ecnoding'), false)
        })

    })

    describe('"redirect()" method',  function() {

        it(`should set "Location" header to provided url`, function(t) {
            const expected = encodeURI('/path')
            const aResponse = new HttpResponse(new FeaturesMock(),new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.redirect(expected)

            assert.strictEqual(aResponse.getHeader('Location'), expected)
        })

        it(`should set status code to 302`, function(t) {
            const expected = encodeURI('/path')
            const aResponse = new HttpResponse(new FeaturesMock(),new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.redirect(expected)
            assert.strictEqual(aResponse.statusCode, 302)
        })

        it(`should not set status code if the response already have redirecting status`, function(t) {
            const expected = encodeURI('/path')
            const aResponse = new HttpResponse(new FeaturesMock(),new ServerResponse({ method: 'GET' }), new AbortController())

            aResponse.statusCode = 304
            aResponse.redirect(expected)

            assert.strictEqual(aResponse.statusCode, 304)
        })

        it('should stop current pipeline', function(t) {
            const aAbortControllerMock = new AbortController()
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), aAbortControllerMock)

            aResponse.redirect('/path')

            assert.strictEqual(aAbortControllerMock.signal.aborted, true)
        })

    })

})