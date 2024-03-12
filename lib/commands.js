'use strict'

const { STATUS_CODES } = require('http')
const { Stream } = require('stream')
const {
    kRequestEvent, 
    kParseEvent, 
    kControllerEvent, 
    kResponseEvent, 
    kErrorEvent,
    kSerializeEvent, 
    kWarningEvent, 
    kFinishEvent, 
    kCriticalEvent 
}  = require('../lib/const')
const { 
    RequestEvent, 
    ControllerEvent, 
    ResponseEvent, 
    SerializationEvent, 
    ErrorEvent, 
    WarningEvent, 
    FinishEvent, 
    CriticalEvent,
    TrailersEvent,
    ParseEvent
} = require("./events")


const kTrailerHeader = 'Trailer'
const kCookieHeader = 'Set-Cookie'
const kContentTypeHeader = 'Content-Type'
const kContentLengthHeader = 'Content-Length'
const kTransferEncodingHeader = 'Transfer-Encoding'

const serializer = require('fast-json-stringify')(false)

class RequestEventCommand {

    constructor(features) {
        this._features = features
    }

    execute() {
        const aTarget = this._features.target

        if(aTarget.listenerCount(kRequestEvent) > 0)
            return aTarget.emit(new RequestEvent({ 
                target: aTarget,
                request: this._features.request,
                response: this._features.response,
                pipeline: this._features.pipeline,
            }))
    }

}

class PrepareRequestCommand {

    constructor(features) {
        this._features = features
    }

    execute() {
        const aBody = this._features.requestBody
        const aTarget = this._features.target
        const aRequest = this._features.request

        if(aTarget.listenerCount(kParseEvent) === 0)
            return 

        const anEvent = new ParseEvent({ 
            target: aTarget,
            request: aRequest,
            body: aBody.content,
        })

        return aTarget.emit(anEvent).then(_ => aBody.content = anEvent.body)
    }

}

class ControllerEventCommand {

    constructor(features, handler) {
        this._features = features
        this._handler = handler
    }

    execute() {
        const aTarget = this._features.target

        if(aTarget.listenerCount(kControllerEvent) > 0)
            return aTarget.emit(new ControllerEvent({ 
                target: aTarget,
                request: this._features.request,
                response: this._features.response,
                pipeline: this._features.pipeline,
            }))

    }

}

class ControllerCommand {

    constructor(features, handler) {
        this._features = features
        this._handler = handler
    }

    execute() {
        return this._handler.call(this._features.target, this._features.request, this._features.response)
    }

}

class ResponseEventCommand {

    constructor(features) {
        this._features = features
    }

    execute() {
        const aTarget = this._features.target

        if(aTarget.listenerCount(kResponseEvent) > 0)
            return aTarget.emit(new ResponseEvent({ 
                target: aTarget,
                request: this._features.request,
                response: this._features.response,
                pipeline: this._features.pipeline,
            }))
    }

}

class ErrorCommand {

    constructor(features, error) {
        this._error = error
        this._features = features
    }

    execute() {
        const aBody = this._features.responseBody
        const aTarget = this._features.target
        const aResponse = this._features.response

        this._handle(aResponse, aBody, this._error)

        return aTarget.emit(new ErrorEvent({ 
            target: aTarget,
            error: this._error,
            request: this._features.request,
            response: aResponse,
            pipeline: this._features.pipeline,
        })).catch(error => {
            this._handle(aResponse, aBody, error)
            throw error
        })

    }

    _handle(response, body, error) {
        response.statusCode = error.status == null || !Number.isInteger(error.status) ? 500 : error.status
        body.content = error.content == null ? STATUS_CODES[response.statusCode] : error.content
    }

}

class PrepareResponseCommand {

    constructor(features) {
        this._features = features
    }

    execute() {
        const aBody = this._features.responseBody
        const aTarget = this._features.target
        const aResponse = this._features.response
    
        if(aResponse.statusCode === 304) {
            aResponse.send(null)
    
            if(aResponse.trailers.size !== 0) {
                aResponse.trailers.clear()
                aResponse.headers.delete(kTrailerHeader)
            }

        }
    
        const aHeaders = aResponse.headers
        const aCookies = aResponse.cookies
        const aTrailers = aResponse.trailers
    
        if(aCookies.length !== 0)
            aHeaders.set(kCookieHeader, aResponse.cookies)
    
        if(aTrailers.size !== 0) {
    
            if(!aHeaders.get(kTransferEncodingHeader))
                aHeaders.set(kTransferEncodingHeader, 'chunked')
    
            aHeaders.set(kTrailerHeader, aTrailers.names())
    
        } else {
            aHeaders.delete(kTrailerHeader)
        }

        if(aResponse.body != null) {

            if(!aResponse.headers.has(kContentTypeHeader))
                aResponse.headers.set(kContentTypeHeader, aResponse.contentType)

            return this._preProcessContent(aTarget, aResponse, aBody)

        }

        if(aResponse.headers.has(kTransferEncodingHeader))
            aResponse.headers.delete(kContentLengthHeader);

    }

    _preProcessContent(target, response, body) {

        if(body.type !== 'object')
            return this._processContent(response, body)

        if(target.listenerCount(kSerializeEvent) === 0) {
            body.content = serializer(body.content)
            return this._processContent(response, body)
        }
        
        const anEvent = new SerializationEvent({ 
            target: target,
            response: response,
            body: body.content,
        })

        return target.emit(anEvent).then(_ => {
            body.content = anEvent.body
            return this._processContent(response, body)
        })

    }

    _processContent(response, body) {
        let contentLength

        if(body.type === 'stream') {

            if(!response.headers.has(kTransferEncodingHeader))
                response.headers.set(kTransferEncodingHeader, 'chunked')

        } else if(
            !response.headers.has(kTransferEncodingHeader) && 
            (contentLength = Buffer.byteLength(body.content)) !== Number(response.contentLength)
        ) {
            response.contentLength = contentLength
        } 

        if(response.headers.has(kTransferEncodingHeader))
            response.headers.delete(kContentLengthHeader);

    }

}

class WritingCommand {

    constructor(features) {
        this._features = features
    }

    execute() {
        const aTarget = this._features.target
        const aRequest = this._features.request
        const aResponse = this._features.response

        if(aResponse.raw.headersSent)
            return

        aResponse.raw.writeHead(aResponse.statusCode, [ ...aResponse.headers ])
    
        if(aResponse.body != null && aRequest.method !== 'HEAD' && aResponse.statusCode !== 204) {
    
            if(aResponse.body instanceof Stream) 
                return this._writeStream(aTarget, aResponse)
    
            aResponse.raw.write(aResponse.body)
    
        }
    
        if(aResponse.trailers.size > 0) {
            return this._writeTrailers(aTarget, aResponse)
        }

    }

    _writeStream(target, response) {

        return new Promise((resolve, reject) => 
            response.body.on('end', resolve).on('error', reject).pipe(response.raw, { end: false })
        ).then(_ => {

            if(response.trailers.size > 0) {
                return this._writeTrailers(target, response)
            }

        })
    }

    _writeTrailers(target, response) {
        const aTrailers = response.trailers
    
        const trailers = Object.seal(aTrailers.names().reduce((features, trailer) => { features[trailer] = ''; return features }, {}))

        return target.emit(new TrailersEvent({
            target: target,
            response: response,
            trailers: trailers
        })).then(_ => response.raw.addTrailers(trailers))
    }

}

class WarningEventCommand {

    constructor(features, error) {
        this._error = error
        this._features = features
    }

    execute() {
        const aTarget = this._features.target

        if(aTarget.listenerCount(kWarningEvent) > 0)
            return aTarget.emit(new WarningEvent({ 
                target: aTarget,
                error: this._error,
                request: this._features.request,
                response: this._features.response,
            }))
    } 

}

class FinishEventCommand {

    constructor(features) {
        this._features = features
    }

    execute() {
        const aTarget = this._features.target

        if(aTarget.listenerCount(kFinishEvent) > 0)
            return aTarget.emit(new FinishEvent({ 
                target: aTarget,
                request: this._features.request,
                response: this._features.response,
            }))

    }

}

class CriticalEventCommand {

    constructor(features, error) {
        this._error = error
        this._features = features
    }

    execute() {
        const aTarget = this._features.target

        if(aTarget.listenerCount(kCriticalEvent) > 0)
            return aTarget.emit(new CriticalEvent({ 
                target: aTarget,
                error: this._error,
                request: this._features.request,
                response: this._features.response,
            }))

    }

}

module.exports = {
    RequestEventCommand,
    PrepareRequestCommand,
    ControllerEventCommand,
    ControllerCommand,
    ResponseEventCommand,
    ErrorCommand,
    PrepareResponseCommand,
    WritingCommand,
    WarningEventCommand,
    FinishEventCommand,
    CriticalEventCommand,
}