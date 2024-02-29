'use strict'

const { HttpHeaders } = require('./headers.js');
const { HttpTrailers } = require('./trailers.js');

const kTrailerHeader = 'Trailer'
const kContentTypeHeader = 'Content-Type'
const kContentLengthHeader = 'Content-Length'
const kTransferEncodingHeader = 'Transfer-Encoding'

const kResponseRaw = Symbol('kResponseRaw')
const kResponseStatus = Symbol('kResponseStatus')
const kFeatures = Symbol('kFeatures')

const CONTENT_TYPE = {
    html: 'text/html; charset=utf-8',
    text: 'text/plain; charset=utf-8',
    object: 'application/json; charset=utf-8',
    octet: 'application/octet-stream',
}

class ResponseStatusTypeError extends Error {
    constructor() {
        super(`Response "statusCode" should be number.`)
    }
}

class ResponseStatusRangeError extends Error {
    constructor() {
        super(`Response "statusCode" should be between 100 and 999.`)
    }
}

class ResponseContentLengthError extends Error {
    constructor() {
        super('Response "Content-Length" should be number.')
    }
}

class HttpResponse {

    constructor(features, response, body) {
        this[kFeatures] = features
        this[kResponseRaw] = response
        this[kResponseStatus] = false

        this._body = body
        this._headers = new HttpHeaders(this.raw.getHeaders())
        this._cookies = []
        this._trailers = undefined
        this._statusCode = 200
        this._contentType = undefined
    }

    get raw() {
        return this[kResponseRaw]
    }

    get headers() {
        return this._headers
    }

    get cookies() {
        return this._cookies
    }

    get sent() {
        return this.raw.writableEnded
    }

    get body() {
        return this._body.content
    }

    get trailers() {
        if(this._trailers === undefined)
            this._trailers = new HttpTrailers()

        return this._trailers
    }

    get statusCode() {
        return this._statusCode
    }

    set statusCode(code) {
        
        if(!Number.isInteger(code)) 
            throw new ResponseStatusTypeError

        if(!(code >= 100 && code <= 999)) 
            throw new ResponseStatusRangeError

        if(this.statusCode === 304) 
            this.body = null

        if(this.statusCode === 204) {
            this.body = null
            this._headers.delete(kTrailerHeader)
        }
    
        this[kResponseStatus] = true
        this._statusCode = code
    }

    get contentType() {
        
        if(this._headers.has(kContentTypeHeader))
            return this._headers.get(kContentTypeHeader)

        const aBody = this._body

        if(aBody.type == 'text') {
            return /^\s*</.test(aBody.content) ? CONTENT_TYPE.html : CONTENT_TYPE.text
        } else if(aBody.type == 'bin') {
            return CONTENT_TYPE.octet
        } else if(aBody.type == 'stream') {
            return CONTENT_TYPE.octet
        } else if(aBody.type == 'object') {
            return CONTENT_TYPE.object
        } else {
            return undefined
        }

    }

    set contentType(type) {

        if(type == null) 
            return this._headers.delete(kContentTypeHeader)

        this._headers.set(kContentTypeHeader, type)
    }

    get contentLength() {

        if(this._headers.has(kContentLengthHeader))
            return parseInt(this._headers.get(kContentLengthHeader)) 

        return  undefined
    }

    set contentLength(length) {

        if(length == null) 
            return this._headers.delete(kContentLengthHeader)

        if(Number.isInteger(length) === false) 
            throw new ResponseContentLengthError

        this.headers.set(kContentLengthHeader, length)
    }

    clear() {
        this._cookies = []
        this._headers.clear()
        this._trailers.clear()
        this._body.content = null
    }

    send(body) {
        const aBody = this._body
        aBody.content = body

        if(aBody.type == null) {
            this._contentType = undefined
            this._headers.delete(kContentTypeHeader)
            this._headers.delete(kContentLengthHeader)
            this._headers.delete(kTransferEncodingHeader)
        } 

        this[kFeatures].pipeline.stop()
    }

    redirect(url) {
        const encode = encodeURI(url)
        this._headers.set('Location', encode)

        if(this[kResponseStatus] === false)
            this.statusCode = 302

        return this.send()
    }

}

module.exports = { HttpResponse }