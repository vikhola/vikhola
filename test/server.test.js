const assert = require("node:assert");
const { describe, it } = require('node:test');
const { PassThrough } = require("node:stream");
const { IncomingMessage, ServerResponse } = require("node:http");
const { Server } = require('../lib/server.js');

class FeaturesMock {

    constructor(payload = {}) {
        this.payload = payload
    }

    get(key, callback) {
        callback(null, this.payload[key])
    }

    set(key, value, callback) {
        this.payload[key] = value
        callback()
    }

    delete(key, callback) {
        delete this.payload[key]
        callback()
    }

}

class ServerTest extends Server {

    constructor(options) {
        super(options)
    }

    get router() {
        return this._router
    }

}

class RequestMock extends IncomingMessage {

    constructor(url = '/', method = 'GET') {
        super(new PassThrough())
        this.url = url
        this.method = method
    }

}

class ResponseMock extends ServerResponse {

    constructor(request) {
        super(request)
    }

}

describe('ServerPlugin test', function() {

    describe('constructor', function() {

        it('should set router "caseSensitive" option', async function(t) {
            const expected = false
            const aServer = new ServerTest({ caseSensitive: expected })

            assert.strictEqual(aServer.router.caseSensitive, expected)
        })

        it('should set router "maxParamLength" option', async function(t) {
            const expected = 1
            const aServer = new ServerTest({ maxParamLength: expected })

            assert.strictEqual(aServer.router.maxParamLength, expected)
        })

        it('should set router "allowUnsafeRegex" option', async function(t) {
            const expected = true
            const aServer = new ServerTest({ allowUnsafeRegex: expected })

            assert.strictEqual(aServer.router.allowUnsafeRegex, expected)
        })

        it('should set router "ignoreTrailingSlash" option', async function(t) {
            const expected = true
            const aServer = new ServerTest({ ignoreTrailingSlash: expected })

            assert.strictEqual(aServer.router.ignoreTrailingSlash, expected)
        })

        it('should set router "ignoreDuplicateSlashes" option', async function(t) {
            const expected = true
            const aServer = new ServerTest({ ignoreDuplicateSlashes: expected })

            assert.strictEqual(aServer.router.ignoreDuplicateSlashes, expected)
        })

    })

    describe('"get()" method', function() {

        it('should add handler, route with an "GET" method', async function(t) {
            const aServer = new Server()
            const aRequest = new RequestMock
            const aResponse = new ResponseMock(aRequest)

            const aHandler = t.mock.fn()
            const aErrorListener = t.mock.fn()

            aServer.on('kernel.error', aErrorListener).get('/', aHandler)

            await aServer.callback()(aRequest, aResponse)
            assert.strictEqual(aHandler.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })

    })

    describe('"head()" method', function() {

        it('should add handler, route with an "HEAD" method', async function(t) {
            const aServer = new Server()
            const aRequest = new RequestMock('/', 'HEAD')
            const aResponse = new ResponseMock(aRequest)

            const aHandler = t.mock.fn()
            const aErrorListener = t.mock.fn()

            aServer.on('kernel.error', aErrorListener).head('/', aHandler)

            await aServer.callback()(aRequest, aResponse)
            assert.strictEqual(aHandler.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })

    })

    describe('"post()" method', function() {

        it('should add handler, route with an "POST" method', async function(t) {
            const aServer = new Server()
            const aRequest = new RequestMock('/', 'POST')
            const aResponse = new ResponseMock(aRequest)

            const aHandler = t.mock.fn()
            const aErrorListener = t.mock.fn()

            aServer.on('kernel.error', aErrorListener).post('/', aHandler)

            await aServer.callback()(aRequest, aResponse)
            assert.strictEqual(aHandler.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })

    })

    describe('"put()" method', function() {

        it('should add handler, route with an "PUT" method', async function(t) {
            const aServer = new Server()
            const aRequest = new RequestMock('/', 'PUT')
            const aResponse = new ResponseMock(aRequest)

            const aHandler = t.mock.fn()
            const aErrorListener = t.mock.fn()

            aServer.on('kernel.error', aErrorListener).put('/', aHandler)

            await aServer.callback()(aRequest, aResponse)
            assert.strictEqual(aHandler.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })

    })

    describe('"delete()" method', function() {

        it('should add handler, route with an "DELETE" method', async function(t) {
            const aServer = new Server()
            const aRequest = new RequestMock('/', 'DELETE')
            const aResponse = new ResponseMock(aRequest)

            const aHandler = t.mock.fn()
            const aErrorListener = t.mock.fn()

            aServer.on('kernel.error', aErrorListener).delete('/', aHandler)

            await aServer.callback()(aRequest, aResponse)
            assert.strictEqual(aHandler.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })

    })

    describe('"options()" method', function() {

        it('should add handler, route with an "OPTIONS" method', async function(t) {
            const aServer = new Server()
            const aRequest = new RequestMock('/', 'OPTIONS')
            const aResponse = new ResponseMock(aRequest)

            const aHandler = t.mock.fn()
            const aErrorListener = t.mock.fn()

            aServer.on('kernel.error', aErrorListener).options('/', aHandler)

            await aServer.callback()(aRequest, aResponse)
            assert.strictEqual(aHandler.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })

    })

    describe('"patch()" method', function() {

        it('should add handler, route with an "PATCH" method', async function(t) {
            const aServer = new Server()
            const aRequest = new RequestMock('/', 'PATCH')
            const aResponse = new ResponseMock(aRequest)

            const aHandler = t.mock.fn()
            const aErrorListener = t.mock.fn()

            aServer.on('kernel.error', aErrorListener).patch('/', aHandler)

            await aServer.callback()(aRequest, aResponse)
            assert.strictEqual(aHandler.mock.callCount(), 1)
            assert.strictEqual(aErrorListener.mock.callCount(), 0)
        })

    })

})