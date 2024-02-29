const assert = require("node:assert");
const { describe, it } = require('node:test');
const { Readable } = require("node:stream");
const { ServerResponse } = require('http')
const { HttpHeaders } = require("../lib/headers.js");
const { HttpTrailers } = require("../lib/trailers.js");
const { HttpResponse } = require("../lib/response.js");
const { HttpBody } = require("../lib/body.js");

class FeaturesMock {

    constructor(pipeline) {
        this.pipeline = pipeline || new PipelineMock()
        this.responseBody = {}
    }

}

class PipelineMock {

    stop() {}

}

describe('HttpResponse test', function() {

    it('"headers" field', function() {
        const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)
        assert.strictEqual(aResponse.headers instanceof HttpHeaders, true)
    })

    it('"body" field', function() {
        const expected = 'test'
        const aFeatures = new FeaturesMock()
        const aBody = new HttpBody()
        const aResponse = new HttpResponse(aFeatures, new ServerResponse({ method: 'GET' }), aBody)

        aBody.content = expected

        assert.strictEqual(aResponse.body, expected)
    })

    it('"cookies" field', async function() {
        const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

        assert.deepEqual(aResponse.cookies, [])
    })

    it('"trailers" field', function() {
        const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)
        assert.strictEqual(aResponse.trailers instanceof HttpTrailers, true)
    })

    describe('"statusCode" field',  function() {

        it('should be able to set and get statusCode', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.statusCode = 204
            assert.strictEqual(aResponse.statusCode, 204)
        })

        it('should throw when status code is not integer', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            assert.throws(_ => aResponse.statusCode = '123', {message: `Response "statusCode" should be number.`})
        })

        it('should throw when the status code is less than 100', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            assert.throws(_ => aResponse.statusCode = 99)
        })

        it('should throw when the status code is greater than 999', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            assert.throws(_ => aResponse.statusCode = 1000, { message: `Response "statusCode" should be between 100 and 999.` })
        })

    })

    describe('"contentType" field', function() {

        it('should be able to set and get "Content-Type" header', function() {
            const expected = 'application/json'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.contentType = expected

            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "text/html; charset=utf-8" when header is not defined and the response body is "html"', async function() {
            const expected = 'text/html; charset=utf-8'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.send('<a href="test"></a>')
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "application/octet-stream" when header is not defined and the response body is "bin"', async function() {
            const expected = 'application/octet-stream'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.send(Buffer.from('123'))
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "application/octet-stream" when header is not defined and the response body is "stream"', async function() {
            const expected = 'application/octet-stream'
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.send(Readable.from('test'))
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "application/json" when header is not defined and the response body is "json"', async function() {
            const expected = 'application/json; charset=utf-8'     
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.send({ a: 1 })
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should return "text/plain; charset=utf-8" when header is not defined and the response body is "text"', async function() {
            const expected = 'text/plain; charset=utf-8'  
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.send('foo')
            assert.strictEqual(aResponse.contentType, expected)
        })

        it('should be get default "Content-Type" value if header is not present', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.send('foo')
            assert.strictEqual(aResponse.contentType, "text/plain; charset=utf-8")
        })

        it('should remove "Content-Type" header', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.headers.set('Content-Type', 'application/octet-stream')
            aResponse.contentType = null

            assert.strictEqual(aResponse.headers.has('Content-Type'), false)
        })

    })

    describe('"contentLength" field', function() {

        it('should be able to set and get "Content-Length" header', function() {
            const expected = 200
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.contentLength = expected

            assert.strictEqual(aResponse.contentLength, expected)
        })

        it('should remove "Content-Length" header', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.headers.set('Content-Length', 20)
            aResponse.contentLength = null

            assert.strictEqual(aResponse.headers.has('Content-Length'), false)
        })

        it('should throw an Error when "Content-Length" headers is not type of number', function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)

            assert.throws(_ => aResponse.contentLength = 'bar', { message: 'Response "Content-Length" should be number.' })
        })

    })

    describe('"clear()" method', async function() {

        it('should clear current response', async function() {
            const aResponse = new HttpResponse(new FeaturesMock(), new ServerResponse({ method: 'GET' }), new HttpBody)
    
            aResponse.headers.set('foo', 'bar')
            aResponse.trailers.add('foo')
            aResponse.send('test')
            
            aResponse.clear()
    
            assert.strictEqual(aResponse.body, undefined)
            assert.strictEqual(aResponse.bodyWriter, undefined)
            assert.deepStrictEqual([ ...aResponse.headers ], [])
            assert.deepStrictEqual([ ...aResponse.trailers ], [])
        })

    })

    describe('"send()" method', async function() {

        it('should stop current pipeline', async function(t) {
            const aPipeline = new PipelineMock
            const aResponse = new HttpResponse(new FeaturesMock(aPipeline), new ServerResponse({ method: 'GET' }), new HttpBody)

            const mock = t.mock.method(aPipeline, "stop")

            aResponse.send()

            assert.strictEqual(mock.mock.callCount(), 1)
        })

        it('should be able to set the HttpBody content', function() {
            const expected = 'test'
            const aBody = new HttpBody
            const aPipeline = new PipelineMock
            const aFeatures = new FeaturesMock(aPipeline)
            const aResponse = new HttpResponse(aFeatures, new ServerResponse({ method: 'GET' }), aBody)

            aResponse.send(expected)

            assert.strictEqual(aBody.content, expected)
        })

        it('should remove body, type and all it headers when body is null', async function() {
            const aFeatures = new FeaturesMock()
            const aResponse = new HttpResponse(aFeatures, new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.headers.set('Transfer-Encoding', 'chunked')
            aResponse.contentType = 'text/html; charset=utf-8'
            aResponse.contentLength = Buffer.byteLength('<a href="test"></a>')
            aResponse.send('<a href="test"></a>')
            aResponse.send(null)
            
            assert.strictEqual(aResponse.body, undefined)
            assert.strictEqual(aResponse.contentType, undefined)
            assert.strictEqual(aResponse.contentLength, undefined)
            assert.strictEqual(aFeatures.responseBody.type, undefined)
            assert.strictEqual(aFeatures.responseBody.content, undefined)
            assert.strictEqual(aResponse.headers.has('Transfer-Ecnoding'), false)
        })

    })

    describe('"redirect()" method',  function() {

        it(`should set "Location" header to provided url`, function(t) {
            const expected = encodeURI('/path')
            const aPipeline = new PipelineMock
            const aResponse = new HttpResponse(new FeaturesMock(aPipeline),new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.redirect(expected)

            assert.strictEqual(aResponse.headers.get('Location'), expected)
        })

        it(`should set status code to 302`, function(t) {
            const expected = encodeURI('/path')
            const aPipeline = new PipelineMock
            const aResponse = new HttpResponse(new FeaturesMock(aPipeline),new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.redirect(expected)
            assert.strictEqual(aResponse.statusCode, 302)
        })

        it(`should not set status code if the response already have redirecting status`, function(t) {
            const expected = encodeURI('/path')
            const aPipeline = new PipelineMock
            const aResponse = new HttpResponse(new FeaturesMock(aPipeline),new ServerResponse({ method: 'GET' }), new HttpBody)

            aResponse.statusCode = 304
            aResponse.redirect(expected)

            assert.strictEqual(aResponse.statusCode, 304)
        })

        it('should stop current pipeline', async function(t) {
            const aPipeline = new PipelineMock
            const aResponse = new HttpResponse(new FeaturesMock(aPipeline), new ServerResponse({ method: 'GET' }), new HttpBody)

            const mock = t.mock.method(aPipeline, "stop")

            aResponse.redirect('/path')

            assert.strictEqual(mock.mock.callCount(), 1)
        })

    })

})