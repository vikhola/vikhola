'use strict'

const qs = require('querystring')
const { Cookie } = require('@vikhola/cookies')
const { parse, serialize } = require('fast-uri')
const { HttpMessage } = require('./message.js')
const { kFeatures, kRequestBody } = require('./const.js')

const kRequestRaw = Symbol('kRequestRaw')
const kRequestOriginalUrl = Symbol('kRequestOriginalUrl')

const kRequestCookieHeader = 'Cookie'
const kRequestContentTypeHeader = 'Content-Type'
const kRequestContentLengthHeader = 'Content-Length'

class HttpRequest extends HttpMessage {

    constructor(features, request, params) {
        super(request.headers)
        this[kFeatures] = features
        this[kRequestRaw] = request

        this._url = this.raw.url
        this._query = {}
        this._params = params
        this._cookies = Cookie.from(this.getHeader(kRequestCookieHeader))
    }

    get raw() {
        return this[kRequestRaw]
    }

    get body() {
        if(this[kFeatures].has(kRequestBody))
            return this[kFeatures].get(kRequestBody).value
    }

    get cookies() {
        return this._cookies
    }

    get method() {
        return this.raw.method
    }

    get socket() {
        return this.raw.socket
    }

    get ip() {
        return this.socket.remoteAddress || ''
    }

    get contentType() {
        return this.getHeader(kRequestContentTypeHeader)
    }

    get contentLength() {
        return parseInt(this.getHeader(kRequestContentLengthHeader)) || undefined
    }

    get protocol() {
        return this.socket.encrypted ? 'https' : 'http'
    }

    get secure () {
        return this.protocol === 'https'
    }

    get host() {
        return this.raw.httpVersionMajor >= 2 ? this.getHeader(':authority', 'host') : this.getHeader('host')
    }

    get originalUrl() {
        if (!this[kRequestOriginalUrl]) 
            this[kRequestOriginalUrl] = this.raw.originalUrl || this.raw.url
        
        return this[kRequestOriginalUrl]
    }

    get url() {
        return this._url
    }

    set url(url = '') {
        this._url = url
    }

    get path() {
        return parse(this.url).path
    }

    set path(path) {
        const url = parse(this.url)
        if(url.path === path)
            return

        url.path = path
        this.url = serialize(url)
    }

    get params() {
        return this._params
    }

    get querystring() {
        return parse(this.url).query
    }
    
    set querystring(querystring) {
        const url = parse(this.url)

        if (url.query === querystring) 
            return

        url.query = querystring
        this.url = serialize(url)
    }

    get query() {
        const str = this.querystring
        const c = this._query
        return c[str] || (c[str] = qs.parse(str))
    }

    set query(query) {
        this.querystring = qs.stringify(query)
    }

}

module.exports = { HttpRequest }