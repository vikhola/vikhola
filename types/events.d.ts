import { IEmitterEvent, IEmitter } from "./target"
import { IHttpRequest } from "./request"
import { IHttpResponse } from "./response"

interface IServerEvent extends IEmitterEvent {
    /**
     * The `name` property returns current event name.
     */
    readonly name: string | symbol
    /**
     * The `serial` property specifies whether event listeners will be executed in parallel or serially.
     */
    readonly serial: true
    /**
     * The `stopped` property indicates is event propagation has been stopped.
     */
    readonly stopped: boolean
    /**
     * The `target` property is a reference to the emitter onto which the event was dispatched.
     */
    readonly target: IEmitter
}

interface IKernelServerEvent extends IServerEvent {
    /**
     * The `request` property return current context request.
     */
    readonly request: IHttpRequest
    /**
     * The `response` property return current context response.
     */
    readonly response: IHttpResponse
}

interface IKernelServerErrorEvent extends IKernelServerEvent {
    /**
     * The `error` property returns the error that caused the event to trigger.
     */
    readonly error: Error
}

export interface IServerRequestEvent extends IKernelServerEvent {
    readonly name: "kernel.request"
}

export interface IServerControllerEvent extends IKernelServerEvent {
    readonly name: "kernel.controller"
}

export interface IServerResponseEvent extends IKernelServerEvent {
    readonly name: "kernel.response"
}

export interface IServerFinishEvent extends IKernelServerEvent {
    readonly name: "kernel.finish"
}

export interface IServerErrorEvent extends IKernelServerErrorEvent {
    readonly name: "kernel.error"
}

export interface IServerWarningEvent extends IKernelServerErrorEvent {
    readonly name: "kernel.warning"
}

export interface IServerCriticalEvent extends IKernelServerErrorEvent {
    readonly name: "kernel.critical"
}

export interface IServerParseEvent extends IServerEvent {
    readonly name: "kernel.parse"
    /**
     * The `body` gets and sets the request body.
     */
    body: unknown
    /**
     * The `request` property return current context request.
     */
    readonly request: IHttpRequest
}

export interface IServerSerializeEvent extends IServerEvent {
    readonly name: "kernel.serialize"
    /**
     * The `body` gets and sets the response body.
     */
    body: unknown
    /**
     * The `response` property return current context response.
     */
    readonly response: IHttpResponse
}

export interface IServerTrailersEvent extends IServerEvent {
    readonly name: "kernel.trailers"
    /**
     * The `response` property return current context response.
     */
    readonly response: IHttpResponse
    /**
     * The `trailers` property return the response trailers.
     */
    readonly trailers: { [k: string]: any }
}