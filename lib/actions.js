'use strict'

const { STATUS_CODES } = require('http')
const { Stream } = require('stream')
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
} = require("./events.js")
const { pipeline } = require('./pipeline.js')
const { callbackify } = require('./callbackify.js')
const { kResponseBody, kRequestEvent, kParseEvent, kResponseEvent, kControllerEvent, kErrorEvent, kFinishEvent } = require('./const.js')

const kTrailerHeader = 'Trailer'
const kCookieHeader = 'Set-Cookie'
const kContentTypeHeader = 'Content-Type'
const kContentLengthHeader = 'Content-Length'
const kTransferEncodingHeader = 'Transfer-Encoding'

const serializer = require('fast-json-stringify')(false)

class SerializationTypeError extends Error {
    constructor(body) {
        super(`Response body can be only type of "string", "buffer" or "stream", received "${typeof body}".`)
    }
}
class RouteNotFoundError extends Error {
    constructor() {
        super('Route is not found.')
        this.status = 404
        this.response = STATUS_CODES[404]
    }
}

class ControllerArguments {
    constructor(args) {
        this.target = args.target
        this.request = args.request
        this.response = args.response
        this.features = args.features
    }
}

function RequestAction(callback, args) {
    const signal = args.abortController.signal

    function requestEvent(args) {
        if(args.target.listenerCount(kRequestEvent) > 0)
            return args.target.emit(new RequestEvent(args))
    }

    function validateHandler(args) {
        if(args.controller == null)
            throw new RouteNotFoundError
    }

    function parseRequestEvent(args) {
        if(args.target.listenerCount(kParseEvent) > 0)
            return args.target.emit(new ParseEvent(args))
    }

    function controllerEvent(args) {
        if(args.target.listenerCount(kControllerEvent) > 0)
            return args.target.emit(new ControllerEvent(args))
    }

    pipeline([ 
        callbackify(requestEvent), callbackify(validateHandler), callbackify(parseRequestEvent), callbackify(controllerEvent) 
    ], { signal })(callback, { signal, ...args })
}

function ControllerAction(callback, args) {
    callbackify(args => args.controller.call(args.target, new ControllerArguments(args)))(callback, args)
}

function ResponseAction(callback, args) {
    const signal = args.abortController.signal

    function responseEvent(args) {
        if(args.target.listenerCount(kResponseEvent) > 0)
            return args.target.emit(new ResponseEvent(args))
    }

    pipeline(callbackify(responseEvent), { signal })(callback, { signal, ...args })
}

function ErrorAction(callback, args, error) {
    const signal = args.abortController.signal

    if(error == null)
        return callback()

    function errorEvent(args) {
        if(args.target.listenerCount(kErrorEvent) > 0)
            return args.target.emit(new ErrorEvent(args))
    }

    function handle(args) {
        
        const aError = args.error
        const aResponse = args.response

        aResponse.statusCode = aError.status == null || !Number.isInteger(aError.status) ? 500 : aError.status
        aResponse.send(aError.content == null ? STATUS_CODES[aResponse.statusCode] : aError.content)
    }

    function complete(error) {

        if(error)
            handle({ ...args, error })

        callback(error)
    }

    pipeline([ callbackify(errorEvent), callbackify(handle) ], { signal })(complete, { signal, error, ...args })
}

function WritingAction(callback, args, critical) {
    let trailers
    const aRequest = args.request
    const aResponse = args.response
    const aCookies = aResponse.cookies
    
    function serializeEvent(args) {
        const aResponse = args.response
        const aBody = aResponse.body

        if(aBody == null || typeof aBody === 'string' || aBody instanceof Stream || Buffer.isBuffer(aBody))
            return;

        const aEvent = new SerializationEvent(args)

        if(args.target.listenerCount(aEvent.name) === 0)
            return args.features.set(kResponseBody, serializer(aResponse.body))
        else 
            return args.target.emit(aEvent)
 
    }

    function serialize(args) {
        const aBody = args.response.body

        if(aBody != null && typeof aBody !== 'string' && !(aBody instanceof Stream) && !(Buffer.isBuffer(aBody)))
            throw new SerializationTypeError(aBody)

    }

    function trailersEvent(args) {
        const aResponse = args.response

        if(!aResponse.trailers.length || aResponse.writableEnded)
            return

        trailers = Object.seal(aResponse.trailers.reduce((trailers, trailer) => { trailers[trailer] = undefined; return trailers }, {}))

        return args.target.emit(new TrailersEvent({ trailers, ...args }))
    }

    function writeHead(args) {
        let contentLength
        const aResponse = args.response

        if(aResponse.raw.headersSent)
            return

        if(aResponse.statusCode === 304 && aResponse.trailers.length) {
            aResponse.removeHeader(kTrailerHeader)
            aResponse.trailers.forEach(trailer => aResponse.removeTrailer(trailer))
        }

        if(aCookies.length !== 0)
            aResponse.setHeader(kCookieHeader, aResponse.cookies)

        if(aResponse.body != null) {

            if(!aResponse.hasHeader(kContentTypeHeader))
                aResponse.setHeader(kContentTypeHeader, aResponse.contentType)

            if(aResponse.body instanceof Stream) {

                if(!aResponse.hasHeader(kTransferEncodingHeader))
                    aResponse.setHeader(kTransferEncodingHeader, 'chunked')

            } else if(
                !aResponse.hasHeader(kTransferEncodingHeader) && 
                (contentLength = Buffer.byteLength(aResponse.body)) !== Number(aResponse.contentLength)
            ) {
                aResponse.contentLength = contentLength
            } 

        }

        if(aResponse.trailers.length) {

            if(!aResponse.hasHeader(kTransferEncodingHeader))
                aResponse.setHeader(kTransferEncodingHeader, 'chunked')

            aResponse.setHeader(kTrailerHeader, aResponse.trailers)

        }

        if(aResponse.hasHeader(kTransferEncodingHeader))
            aResponse.removeHeader(kContentLengthHeader)

        aResponse.raw.writeHead(aResponse.statusCode, aResponse.headers)

    }

    function writeBody(args) {
        const aResponse = args.response
        const aBody = aResponse.body

        if(aBody == null || aRequest.method === 'HEAD' || aResponse.statusCode === 204 || aResponse.raw.writableEnded)
            return

        if(aBody instanceof Stream) 
            return new Promise((resolve, reject) => 
                aBody.on('end', resolve).on('error', reject).pipe(aResponse.raw, { end: false })
            )
        
        return aResponse.raw.write(aBody)
    }

    function writeTrailers(args) {
        const aResponse = args.response

        if(!aResponse.writableEnded && trailers != null)
            aResponse.raw.addTrailers(trailers)

    }

    function complete(error) {
        
        if(!aResponse.writableEnded)
            aResponse.raw.end()

        callback(critical || error)
    }

    if(aResponse.statusCode === 304) 
        aResponse.send(null)

    return pipeline([ 
        callbackify(serializeEvent), callbackify(serialize), callbackify(writeHead), callbackify(writeBody), callbackify(trailersEvent), callbackify(writeTrailers)
    ])(complete, { signal: args.abortController.signal, ...args })
}

function FinishAction(args) {

    function finishEvent(args) {
        if(args.target.listenerCount(kFinishEvent) > 0)
            return args.target.emit(new FinishEvent(args))
    }
    
    process.nextTick(finishEvent, { ...args })

}

function WarningAction(args, error) {

    function warningEvent(args) {
        return args.target.emit(new WarningEvent(args))
    }
    
    function complete(error) {
        if(error != null) 
            CriticalAction(args, error)
    }

    pipeline(callbackify(warningEvent))(complete, { ...args, error })
}

function CriticalAction(args, error) {

    function criticalEvent(args) {
        return args.target.emit(new CriticalEvent(args))
    }
    
    function complete(error) {
        if(error != null) 
            process.nextTick(_ => { throw error })
    }

    pipeline(callbackify(criticalEvent))(complete, { ...args, error })

}

module.exports = {
    RequestAction,
    ControllerAction,
    ResponseAction,
    ErrorAction,
    WritingAction,
    FinishAction,
    WarningAction,
    CriticalAction,
}