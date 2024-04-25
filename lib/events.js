'use strict'

const { 
    kRequestEvent, 
    kControllerEvent, 
    kResponseEvent, 
    kFinishEvent, 
    kErrorEvent, 
    kWarningEvent, 
    kSerializeEvent, 
    kTrailersEvent,
    kCriticalEvent,
    kParseEvent,
    kRequestBody,
    kResponseBody,
} = require("./const.js")
const { HttpContent } = require("./content.js")

class HttpEvent {

    constructor(args, name) {
        this._args = args
        this._name = name
        this._serial = true
        this._stopped = false
    }

    get name() {
        return this._name
    }

    get serial() {
        return this._serial
    }

    get target() {
        return this._args.target
    }

    get stopped() {
        return this._args.signal.aborted
    }

    get captureRejection() {
        return undefined
    }

}

class RequestEvent extends HttpEvent {

    constructor(args) { 
        super(args, kRequestEvent) 
    }

    get request() {
        return this._args.request
    }

    get response() {
        return this._args.response
    }

    get features() {
        return this._args.features
    }

}

class ControllerEvent extends HttpEvent {

    constructor(args) { 
        super(args, kControllerEvent) 
    }

    get request() {
        return this._args.request
    }

    get response() {
        return this._args.response
    }

    get features() {
        return this._args.features
    }

}

class ResponseEvent extends HttpEvent {

    constructor(args) { 
        super(args, kResponseEvent) 
    }

    get request() {
        return this._args.request
    }

    get response() {
        return this._args.response
    }

    get features() {
        return this._args.features
    }

}

class FinishEvent extends HttpEvent {

    constructor(args) { 
        super(args, kFinishEvent) 
    }

    get stopped() {
        return false
    }

    get captureRejection() {
        return true
    }

    get request() {
        return this._args.request
    }

    get response() {
        return this._args.response
    }

    get features() {
        return this._args.features
    }

}

class ErrorEvent extends HttpEvent {

    constructor(args) { 
        super(args, kErrorEvent) 
    }

    get error() {
        return this._args.error
    }

    get request() {
        return this._args.request
    }

    get response() {
        return this._args.response
    }

    get features() {
        return this._args.features
    }

}

class WarningEvent extends HttpEvent {

    constructor(args) { 
        super(args, kWarningEvent) 
    }

    get error() {
        return this._args.error
    }

    get stopped() {
        return false
    }
    
}

class CriticalEvent extends HttpEvent {

    constructor(args) { 
        super(args, kCriticalEvent) 
    }

    get error() {
        return this._args.error
    }

    get stopped() {
        return false
    }

}

class ParseEvent extends HttpEvent {

    constructor(args) {
        super(args, kParseEvent)
    }

    get request() {
        return this._args.request
    }

    get body() {
        if(this._args.features.has(kRequestBody))
            return this._args.features.get(kRequestBody).value
        else 
            return this._args.request.raw
    }

    set body(body) {
        this._args.features.set(kRequestBody, new HttpContent(body))
    }

}

class SerializationEvent extends HttpEvent {

    constructor(args) {
        super(args, kSerializeEvent)
    }

    get response() {
        return this._args.response
    }

    get body() {
        if(this._args.features.has(kResponseBody))
            return this._args.features.get(kResponseBody).value
    }

    set body(body) {
        this._args.features.set(kResponseBody, new HttpContent(body))
    }

}

class TrailersEvent extends HttpEvent {

    constructor(args) {
        super(args, kTrailersEvent)
    }

    get stopped() {
        return false
    }

    get response() {
        return this._args.response
    }

    get trailers() {
        return this._args.trailers
    }

}

module.exports = { 
    HttpEvent,
    RequestEvent, 
    ControllerEvent, 
    ResponseEvent, 
    FinishEvent,
    ErrorEvent, 
    WarningEvent,
    CriticalEvent,
    TrailersEvent, 
    ParseEvent,
    SerializationEvent
}