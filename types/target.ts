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

export type TEventTargetListener<T = IEventTargetEvent> = (this: IEventTarget, event: T) => any

export interface IEventTargetEvent {
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

export interface IEventTarget extends IEventEmitterInherim  {
    on(eventName: string | symbol, listener: TEventTargetListener, options?: IListenerOptions): this
    on(eventName: "kernel.request", listener: TEventTargetListener<IServerRequestEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.parse", listener: TEventTargetListener<IServerParseEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.controller", listener: TEventTargetListener<IServerControllerEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.response", listener: TEventTargetListener<IServerResponseEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.serialize", listener: TEventTargetListener<IServerSerializeEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.trailers", listener: TEventTargetListener<IServerTrailersEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.error", listener: TEventTargetListener<IServerErrorEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.warning", listener: TEventTargetListener<IServerWarningEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.critical", listener: TEventTargetListener<IServerCriticalEvent>, options?: IListenerOptions): this
    on(eventName: "kernel.finish", listener: TEventTargetListener<IServerFinishEvent>, options?: IListenerOptions): this
    off(eventName: string | symbol, listener: TEventTargetListener): this
    rawListeners(eventName: string | symbol | IEventTargetEvent): IEventEmitterListenerBucket[];
    emit(event: IEventTargetEvent): Promise<boolean>
}