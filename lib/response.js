'use strict'

const { Stream } = require('stream')
const { HttpMessage } = require('./message.js')
const { kFeatures, kAbortController, kResponseBody } = require('./const.js')
const { HttpContent } = require('./content.js')

const kTrailerHeader = 'trailer'
const kContentTypeHeader = 'content-type'
const kContentLengthHeader = 'content-length'
const kTransferEncodingHeader = 'transfer-encoding'

const kTrailers = Symbol('kTrailers')
const kResponseRaw = Symbol('kResponseRaw')
const kResponseStatus = Symbol('kResponseStatus')

const INVALID_TRAILERS = new Set([
    '',
    'transfer-encoding',
    'content-length',
    'host',
    'cache-control',
    'max-forwards',
    'te',
    'authorization',
    'set-cookie',
    'content-encoding',
    'content-type',
    'content-range',
    'trailer'
])

const CONTENT_TYPE = {
    bin: 'application/octet-stream',
    html: 'text/html; charset=utf-8',
    text: 'text/plain; charset=utf-8',
    object: 'application/json; charset=utf-8',
    stream: 'application/octet-stream',
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

class TrailerNameInvalidError extends Error {
    constructor(name) {
        super(`Trailer name "${name}" is invalid.`)
    }
}

class TrailerIsAlreadySentError extends Error {
    constructor(name) {
        super(`Trailer header is already sent.`)
    }
}

class HttpResponse extends HttpMessage {

    constructor(features, response, controller) {
        super(response.getHeaders())
        this[kFeatures] = features
        this[kTrailers] = new Set()
        this[kResponseRaw] = response
        this[kResponseStatus] = false
        this[kAbortController] = controller

        this._cookies = []
        this._statusCode = 200
    }

    get raw() {
        return this[kResponseRaw]
    }

    get sent() {
        return this.raw.writableEnded
    }

    get body() {
        if(this[kFeatures].has(kResponseBody))
            return this[kFeatures].get(kResponseBody).value
    }

    get cookies() {
        return this._cookies
    }

    get trailers() {
        return [ ...this[kTrailers] ]
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
            this.removeHeader(kTrailerHeader)
        }
    
        this[kResponseStatus] = true
        this._statusCode = code
    }

    get contentType() {

        if(this.hasHeader(kContentTypeHeader))
            return this.getHeader(kContentTypeHeader)

        if(this[kFeatures].has(kResponseBody))
            return CONTENT_TYPE[this[kFeatures].get(kResponseBody).type] || CONTENT_TYPE.text

    }

    set contentType(type) {

        if(type == null) 
            return this.removeHeader(kContentTypeHeader)

        this.setHeader(kContentTypeHeader, type)
    }

    get contentLength() {

        if(this.hasHeader(kContentLengthHeader))
            return parseInt(this.getHeader(kContentLengthHeader)) 

        return  undefined
    }

    set contentLength(length) {

        if(length == null) 
            return this.removeHeader(kContentLengthHeader)

        if(Number.isInteger(length) === false) 
            throw new ResponseContentLengthError

        this.setHeader(kContentLengthHeader, length)
    }

    addTrailer(name) {

        if(this.raw.headersSent)
            throw new TrailerIsAlreadySentError

        if(!this._validateName(name) || INVALID_TRAILERS.has(name.toLowerCase()))
            throw new TrailerNameInvalidError(name)

        this[kTrailers].add(name)
        
        return this
    }

    hasTrailer(name) {
        return this[kTrailers].has(name)
    }

    removeTrailer(name) {

        if(this.raw.headersSent)
            throw new TrailerIsAlreadySentError

        this[kTrailers].delete(name)

        return this
    }

    send(body) {

        this[kAbortController].abort()

        if(body == null) {
            this.removeHeader(kContentTypeHeader)
            this.removeHeader(kContentLengthHeader)
            this.removeHeader(kTransferEncodingHeader)
            this[kFeatures].remove(kResponseBody)
            return 
        } 

        this[kFeatures].set(kResponseBody, new HttpContent(body))
    }

    redirect(url) {
        const encode = encodeURI(url)
        this.setHeader('Location', encode)

        if(this[kResponseStatus] === false)
            this.statusCode = 302

        return this.send()
    }

}

module.exports = { HttpResponse }