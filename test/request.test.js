const assert = require('node:assert');
const { describe, it } = require('node:test');
const { Readable, Duplex } = require('stream');
const { Cookie } = require('@vikhola/cookies');
const { HttpRequest } = require('../lib/request.js');
const { kRequestBody } = require('../lib/const.js');

const data = JSON.stringify({
    first_name: 'Jhon',
    last_name: 'Dou',
    items: ['bottle', 'chair']
})

class FeaturesMock extends Map {}

class SocketMock extends Duplex {

    constructor({remoteAddress, encrypted} = {}) {
        super()
        this.encrypted = encrypted
        this.remoteAddress = remoteAddress
    }

}

class RequestMock extends Readable {

    constructor({ url, body, socket, method, headers, httpVersion } = {}) {
        super()
        this.url = url || ''
        this.socket = socket || {}
        this.method = method
        this.headers = headers || {}
        if(!httpVersion) httpVersion = '1.1'
        this.httpVersionMajor = httpVersion.split('.')[0]
        this.httpVersionMinor = httpVersion.split('.')[1]
        this.body = body
        this.originalUrl = this.url
    }

    _read() {
        if(this.body) {
            this.body.on('end', () => this.push(null))
            this.body.on('data', (chunk) => { if(!this.push(chunk)) body.pause() })
        }
    }

}

describe('HttpRequest test', function() {

    it('"ip" option', function() {
        const socket = new SocketMock({ remoteAddress: '127.0.0.1' })
        const request = new RequestMock({ socket }) 
        const aRequest = new HttpRequest(new FeaturesMock(),request)
        assert.strictEqual(aRequest.ip, '127.0.0.1')
    })

    it('"method" option', function() {
        const method = 'GET'
        const request = new RequestMock({ method }) 
        const aRequest = new HttpRequest(new FeaturesMock(),request)
        assert.equal(aRequest.method, method)
    })

    it('"socket" option', function() {
        const socket = new SocketMock()
        const request = new RequestMock({ socket }) 
        const aRequest = new HttpRequest(new FeaturesMock(),request)
        assert.strictEqual(aRequest.socket, socket)
    })

    describe('"body", option', function() {

        it('should return the request body from the featrues', function() {
            const expected = 'foo'
            const socket = new SocketMock()
            const request = new RequestMock({ socket }) 
            const aFeatures = new FeaturesMock()
            const aRequest = new HttpRequest(aFeatures, request, {})
            
            aFeatures.set(kRequestBody, { value: expected })
    
            assert.strictEqual(aRequest.body, expected)
        })

        it('should return undefined if the request body is not defined', function() {
            const expected = 'foo'
            const socket = new SocketMock()
            const request = new RequestMock({ socket }) 
            const aFeatures = new FeaturesMock()
            const aRequest = new HttpRequest(aFeatures, request, {})

            assert.strictEqual(aRequest.body, undefined)
        })


    })

    describe('"contentType", option', function() {

        it('should return the request "Content-Type" header', function() {
            const request = new RequestMock({ headers: { 'content-type': 'application/json' }  })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.contentType, 'application/json')
        })

        it('should return undefined if the request "Content-Type" header is not present', function() {
            const request = new RequestMock({ headers: {}  })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.contentType, undefined)
        })

        it('should return undefined if the request "Content-Type" header is empty string', function() {
            const request = new RequestMock({ headers: { 'content-type': '' }  })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.contentType, undefined)
        })
    
    })

    describe('"constentLength", option', function() {

        it('should return parsed the request "Content-Legth" header', function() {
            const request = new RequestMock({ headers: { 'content-length': '200' }  })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.contentLength, 200)
        })

        it('should return undefined if the request "Content-Legth" header is not present', function() {
            const request = new RequestMock({ headers: {}  })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.contentLength, undefined)
        })

        it('should return undefined if the request "Content-Legth" header is empty string', function() {
            const request = new RequestMock({ headers: { 'content-length': '' }  })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.contentLength, undefined)
        })
    
    })

    describe('"cookies" option', function() {

        it('should return empty array if Cookie header is not present', function() {
            const request = new RequestMock({ headers: { } })
            const aRequest = new HttpRequest(new FeaturesMock(),request)

            assert.deepEqual(aRequest.cookies, [])
        })

        it('should parse request cookies', function() {
            const request = new RequestMock({ headers: { 'cookie': 'foo=bar; bar=baz' }  })
            const aRequest = new HttpRequest(new FeaturesMock(),request)

            assert.deepEqual(aRequest.cookies, [ new Cookie('foo', 'bar'), new Cookie('bar', 'baz') ])
        })

    })

    describe('"protocol" option', function() {

        it('should return "https" when socket is encrypted', function() {
            const socket = new SocketMock({ encrypted: true })
            const request = new RequestMock({ socket })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.protocol, 'https')
        })

        it('should return `http` when socket is unencrypted', function() {
            const socket = new SocketMock({ encrypted: false })
            const request = new RequestMock({ socket })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.protocol, 'http')
        })

    })

    describe('"host" option', async function() {

        it('should return a host with his port', async function() {
            const headers = { host: 'localhost:3000' }
            const request = new RequestMock({ headers })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.host,  headers.host)
        })
        
        it('should return a "host" header when a request is not HTTP/2', async function() {
            const headers = { 'host': 'bar.com:8000', ':authority': 'foo.com:3000' }
            const request = new RequestMock({ headers })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.host, 'bar.com:8000')
        })

        it('should return a ":authority" header when a request is HTTP/2', async function() {
            const headers = { 'host': 'bar.com:8000', ':authority': 'foo.com:3000' }
            const request = new RequestMock({ headers, httpVersion: '2.0' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.host, 'foo.com:3000')
        })

        it('should return a "host" header as HTTP/2 fallback', async function() {
            const headers = { 'host': 'bar.com:8000' }
            const request = new RequestMock({ headers, httpVersion: '2.0' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.host, 'bar.com:8000')
        })

    })

    describe('"url" option', function() {

        it('should return request url', function() {
            const expected = '/?page=2'
            const request = new RequestMock({ url: expected })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.url, expected)
        })

        it('should update a url', function() {
            const expected = '/store/shoes?page=2&color=blue'
            const request = new RequestMock({ url: '/store/shoes' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.url = expected
            assert.strictEqual(aRequest.url, expected)
        })
      
        it('should not change upadte originalUrl', function() {
            const expected = '/store/shoes' 
            const request = new RequestMock({ url: expected })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.url = '/store/shoes?page=2&color=blue'
            assert.strictEqual(aRequest.originalUrl, expected)
        })

    })

    describe('"path" option', function() {

        it('should return a request path', function() {
            const request = new RequestMock({ url: '/login?next=/dashboard' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.path, '/login')
        })

        it('should set a request path', function() {
            const request = new RequestMock({ url: '/login?next=/dashboard' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.path = '/logout'
            assert.strictEqual(aRequest.path, '/logout')
            assert.strictEqual(aRequest.url, '/logout?next=/dashboard')
        })
      
        it('should update only an url not originalUrl', function() {
            const request = new RequestMock({ url: '/login' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.path = '/logout'
            assert.strictEqual(aRequest.url, '/logout')
            assert.strictEqual(aRequest.originalUrl, '/login')
            assert.strictEqual(aRequest.raw.originalUrl, '/login')
        })

    })

    describe('"querystring" option', function() {

        it('should get a querystring', function() {
            const request = new RequestMock({ url: '/store/shoes?page=2&color=blue' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.querystring, 'page=2&color=blue')
        })
        
        it('should set a querystring', function() {
            const request = new RequestMock({ url: '/store/shoes' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.querystring = 'page=2&color=blue'
            assert.strictEqual(aRequest.url, '/store/shoes?page=2&color=blue')
            assert.strictEqual(aRequest.querystring, 'page=2&color=blue')
        })

        it('should update only a url not originalUrl', function() {
            const request = new RequestMock({ url: '/store/shoes' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.querystring = 'page=2&color=blue'
            assert.strictEqual(aRequest.url, '/store/shoes?page=2&color=blue')
            assert.strictEqual(aRequest.originalUrl, '/store/shoes')
            assert.strictEqual(aRequest.raw.originalUrl, '/store/shoes')
        })

    })

    describe('"query" option', function() {

        it('should get an empty object when query in undefined', function() {
            const request = new RequestMock({ url: '/' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert(!Object.keys(aRequest.query).length)
        })
    
        it('should get the same object each time it\'s accessed', function() {
            const request = new RequestMock({ url: '/' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.query.a = '2'
            assert.strictEqual(aRequest.query.a, '2')
        })

        it('should get a parsed query string', function() {
            const request = new RequestMock({ url: '/?page=2' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            assert.strictEqual(aRequest.query.page, '2')
        })

        it('should update a url', function() {
            const request = new RequestMock({ url: '/store/shoes' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.query = { page: 2, color: 'blue' }
            assert.strictEqual(aRequest.url, '/store/shoes?page=2&color=blue')
            assert.strictEqual(aRequest.querystring, 'page=2&color=blue')
        })
      
        it('should update only a url not originalUrl', function() {
            const request = new RequestMock({ url: '/store/shoes' })
            const aRequest = new HttpRequest(new FeaturesMock(),request)
            aRequest.query = { page: 2 }
            assert.strictEqual(aRequest.url, '/store/shoes?page=2')
            assert.strictEqual(aRequest.originalUrl, '/store/shoes')
            assert.strictEqual(aRequest.raw.originalUrl, '/store/shoes')
        })

    })

})