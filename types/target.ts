import { IEventEmitter, IEventEmitterListenerBucket, IListenerOptions } from "@vikhola/events"
import { 
    IServerControllerEvent, 
    IServerCriticalEvent, 
    IServerErrorEvent, 
    IServerFinishEvent, 
    IServerParseEvent, 
    IServerRequestEvent, 
    IServerResponseEvent, 
    IServerSerializeEvent, 
    IServerTrailersEvent, 
    IServerWarningEvent 
} from "./events"

interface IEventEmitterInherim extends IEventEmitter {
    on(eventName: string | symbol, listener: any, options?: IListenerOptions): this
    off(eventName: string | symbol, listener: any): this
    emit(event: any): Promise<boolean>
}

export type TEmitterListener<T = IEmitterEvent> = (this: IEmitter, event: T) => any

export interface IEmitterEvent {
    /**
     * The `name` property returns current event name.
     */
    name: string | symbol
    /**
     * The `serial` property specifies whether event listeners will be executed in parallel or serially.
     */
    serial?: boolean
    /**
     * The `stopped` property indicates is event propagation has been stopped.
     */
    stopped?: boolean
}

export interface IEmitter extends IEventEmitterInherim  {
    on(eventName: string | symbol, listener: TEmitterListener, options?: IListenerOptions): this
    on(eventName: "kernel.request", listener: TEmitterListener<IServerRequestEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.parse", listener: TEmitterListener<IServerParseEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.controller", listener: TEmitterListener<IServerControllerEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.response", listener: TEmitterListener<IServerResponseEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.serialize", listener: TEmitterListener<IServerSerializeEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.trailers", listener: TEmitterListener<IServerTrailersEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.error", listener: TEmitterListener<IServerErrorEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.warning", listener: TEmitterListener<IServerWarningEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.critical", listener: TEmitterListener<IServerCriticalEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.finish", listener: TEmitterListener<IServerFinishEvent>, options?: IListenerOptions): this
    off(eventName: string | symbol, listener: TEmitterListener): this
    rawListeners(eventName: string | symbol): IEventEmitterListenerBucket[];
    emit(event: IEmitterEvent): Promise<boolean>
}