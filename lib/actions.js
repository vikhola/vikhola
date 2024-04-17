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
const { kResponseBody, kParseEvent, kFinishEvent } = require('./const.js')

const kTrailerHeader = 'Trailer'
const kCookieHeader = 'Set-Cookie'
const kContentTypeHeader = 'Content-Type'
const kContentLengthHeader = 'Content-Length'
const kTransferEncodingHeader = 'Transfer-Encoding'

const serializer = require('fast-json-stringify')(false)

class SerializationBodyTypeError extends Error {
    constructor(body) {
        super(`Response body can be only type of "string", "buffer" or "stream".`)
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
    const target = args.target
    const actions = []

    function requestEvent(args) {
        return args.target.emit(new RequestEvent(args))
    }

    function validateHandler(args) {
        if(args.controller == null)
            throw new RouteNotFoundError
    }

    function parseRequestEvent(args) {
        return args.target.emit(new ParseEvent(args))
    }

    function controllerEvent(args) {
        return args.target.emit(new ControllerEvent(args))
    }

    actions.push(callbackify(requestEvent))
    actions.push(callbackify(validateHandler))

    if(target.listenerCount(kParseEvent) > 0)
        actions.push(callbackify(parseRequestEvent))

    actions.push(callbackify(controllerEvent))

    pipeline(actions, { signal })(callback, { signal, ...args })
}

function ControllerAction(callback, args) {
    callbackify(args => args.controller.call(args.target, new ControllerArguments(args)))(callback, args)
}

function ResponseAction(callback, args) {
    const signal = args.abortController.signal

    function responseEvent(args) {
        return args.target.emit(new ResponseEvent(args))
    }

    pipeline([ callbackify(responseEvent) ], { signal })(callback, { signal, ...args })
}

function ErrorAction(callback, args, error) {
    const signal = args.abortController.signal

    if(error == null)
        return callback()

    function errorEvent(args) {
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
    const actions = []

    function serializeEvent(args) {

        const aEvent = new SerializationEvent(args)

        if(!args.target.listenerCount(aEvent.name))
            return args.features.set(kResponseBody, serializer(args.response.body))
        else 
            return args.target.emit(aEvent)
 
    }

    function serialize(args) {
        const aBody = args.response.body

        if(aBody == null || (typeof aBody !== 'string' && !(aBody instanceof Stream) && !(Buffer.isBuffer(aBody))))
            throw new SerializationBodyTypeError(aBody)

    }

    function trailersEvent(args) {
        const aResponse = args.response

        if(!aResponse.trailers.length || aResponse.writableEnded)
            return

        const trailers = args.trailers = Object.seal(aResponse.trailers.reduce((trailers, trailer) => { trailers[trailer] = undefined; return trailers }, {}))

        return args.target.emit(new TrailersEvent({ trailers, ...args }))
    }

    function write(args) {
        const aRequest = args.request
        const aResponse = args.response

        if(aResponse.statusCode === 304) {

            aResponse.send(null)

            if(aResponse.trailers.length) {
                aResponse.removeHeader(kTrailerHeader)
                aResponse.trailers.forEach(trailer => aResponse.removeTrailer(trailer))
            }

        }

        const aBody = args.response.body
        const aTrailers = args.response.trailers

        actions.push(callbackify(writeHead))

        if(aBody != null && aRequest.method !== 'HEAD' && aResponse.statusCode !== 204)
            actions.push(callbackify(writeBody))

        if(aTrailers.length !== 0) {
            actions.push(callbackify(trailersEvent))
            actions.push(callbackify(writeTrailers))
        }

    }

    function writeHead(args) {
        let contentLength
        const aResponse = args.response
        const aCookies = aResponse.cookies

        if(aResponse.raw.headersSent)
            return

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

        if(aResponse.raw.writableEnded)
            return

        if(aBody instanceof Stream) 
            return new Promise((resolve, reject) => 
                aBody.on('end', resolve).on('error', reject).pipe(aResponse.raw, { end: false })
            )
        
        return aResponse.raw.write(aBody)
    }

    function writeTrailers(args) {
        const aResponse = args.response

        if(!aResponse.writableEnded && args.trailers != null)
            aResponse.raw.addTrailers(args.trailers)

    }

    function complete(error) {
        
        if(!aResponse.writableEnded)
            aResponse.raw.end()

        callback(critical || error)
    }

    const aResponse = args.response
    const aBody = args.response.body

    if(aBody != null && typeof aBody !== 'string' && !(aBody instanceof Stream) && !Buffer.isBuffer(aBody) && aResponse.statusCode !== 304) {
        actions.push(callbackify(serializeEvent))
        actions.push(callbackify(serialize))
    }

    actions.push(callbackify(write))

    return pipeline(actions)(complete, { signal: args.abortController.signal, trailers: undefined, ...args })
}

function FinishAction(args) {

    function finishEvent(args) {
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

    callbackify(warningEvent)(complete, { ...args, error })
}

function CriticalAction(args, error) {

    function criticalEvent(args) {
        return args.target.emit(new CriticalEvent(args))
    }
    
    function complete(error) {
        if(error != null) 
            process.nextTick(_ => { throw error })
    }

    callbackify(criticalEvent)(complete, { ...args, error })

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