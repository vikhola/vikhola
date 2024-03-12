'use strict'

const { Stream } = require('stream')
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
} = require("./const.js")

class SerializationTypeError extends Error {
    constructor(body) {
        super(`Response body can be only type of "string", "buffer" or "stream", received "${typeof body}".`)
    }
}

class HttpEvent {

    constructor(args, name, serial = true) {
        this._args = args
        this._name = name
        this._serial = Boolean(serial)
        this._stopped = false
    }

    get name() {
        return this._name
    }

    get serial() {
        return this._serial
    }

    get stopped() {
        return this._stopped
    }

    get target() {
        return this._args.target
    }

}

class KernelEvent extends HttpEvent  {

    constructor(args, name, serial) {
        super(args, name, serial)
        this._args = args
    }

    get request() {
        return this._args.request
    }

    get response() {
        return this._args.response
    }

    get stopped() {
        return this._args.pipeline.stopped
    }

}

class RequestEvent extends KernelEvent {

    constructor(args) { 
        super(args, kRequestEvent) 
    }

}

class ControllerEvent extends KernelEvent {

    constructor(args) { 
        super(args, kControllerEvent) 
    }

}

class ResponseEvent extends KernelEvent {

    constructor(args) { 
        super(args, kResponseEvent) 
    }

}

class ErrorEvent extends KernelEvent {

    constructor(args) { 
        super(args, kErrorEvent) 
    }

    get error() {
        return this._args.error
    }

}

class FinishEvent extends KernelEvent {

    constructor(args) { 
        super(args, kFinishEvent) 
    }

    get stopped() {
        return false
    }

}

class WarningEvent extends KernelEvent {

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

class CriticalEvent extends KernelEvent {

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

        if(this._args.body == null)
            return this._args.request.raw

        return this._args.body
    }

    set body(body) {
        this._args.body = body
    }

}

class SerializationEvent extends HttpEvent {

    constructor(args) {
        super(args, kSerializeEvent)
    }

    get stopped() {
        return false
    }

    get response() {
        return this._args.response
    }

    get body() {
        return this._args.body
    }

    set body(body) {

        if(typeof body !== 'string' && !Buffer.isBuffer(body) && !(body instanceof Stream)) 
            throw new SerializationTypeError(body)

        this._args.body = body
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
    KernelEvent,
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