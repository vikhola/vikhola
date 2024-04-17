import { Config } from "find-my-way";
import { ListenOptions } from "net";
import { IncomingMessage, Server as NodeServer, ServerResponse } from "http";
import { IEventEmitterListenerBucket, IListenerOptions,TListenerEntry } from "@vikhola/events";
import { IServer, THTTPMethod, THandler } from "./types/server";
import { IEmitter, IEmitterEvent, TEmitterListener } from "./types/target";
import {
    IServerRequestEvent, 
    IServerControllerEvent, 
    IServerResponseEvent, 
    IServerSerializeEvent, 
    IServerTrailersEvent, 
    IServerErrorEvent, 
    IServerWarningEvent, 
    IServerCriticalEvent, 
    IServerFinishEvent,
    IServerParseEvent, 
} from "./types/events"

declare module "vikhola" {

    type TServerOptions = Pick<Config<any>, 'allowUnsafeRegex' | 'caseSensitive' | 'ignoreDuplicateSlashes' | 'ignoreTrailingSlash' | 'maxParamLength' >
    
    export class Server implements IServer {
        /**
         * @param options.caseSensitive When `true` routes are registered as case-sensitive.
         * @param options.allowUnsafeRegex When `true` allows unsafe expressions
         * @param options.ignoreTrailingSlash When `true` allows to both /foo and /foo/ point to the same route.
         * @param options.ignoreDuplicateSlashes When `true` removes duplicate slashes from the path. 
         * @param options.maxParamLength Length for parameters in parametric (standard, regex, and multi) routes.
         */
        constructor(options?: TServerOptions)
    
        get(path: string, handler: THandler): IEmitter;
        post(path: string, handler: THandler): IEmitter;
        put(path: string, handler: THandler): IEmitter;
        delete(path: string, handler: THandler): IEmitter;
        head(path: string, handler: THandler): IEmitter;
        options(path: string, handler: THandler): IEmitter;
        patch(path: string, handler: THandler): IEmitter;
        route(method: THTTPMethod, route: string, handler: THandler): IEmitter;
    
        on<T>(eventName: string | symbol, listener: TEmitterListener<T>, options?: IListenerOptions): this
        on(eventName: "kernel.request", listener: TEmitterListener<IServerRequestEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.parse", listener: TEmitterListener<IServerParseEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.controller", listener: TEmitterListener<IServerControllerEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.response", listener: TEmitterListener<IServerResponseEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.serialize", listener: TEmitterListener<IServerSerializeEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.trailers", listener: TEmitterListener<IServerTrailersEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.error", listener: TEmitterListener<IServerErrorEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.warning", listener: TEmitterListener<IServerWarningEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.critical", listener: TEmitterListener<IServerCriticalEvent>, options?: IListenerOptions | undefined): this;
        on(eventName: "kernel.finish", listener: TEmitterListener<IServerFinishEvent>, options?: IListenerOptions | undefined): this;
        off(eventName: string | symbol, listener: TEmitterListener): this
        eventNames(): (string | symbol)[];
        listeners(eventName: string | symbol): TListenerEntry[];
        rawListeners(eventName: string | symbol): IEventEmitterListenerBucket[];
        listenerCount(eventName: string | symbol): number;
        removeAllListeners(eventName?: string | symbol | undefined): this;
        emit(event: IEmitterEvent): Promise<boolean>;
        
        callback(): (request: IncomingMessage, response: ServerResponse<IncomingMessage>) => Promise<void>;
        listen(port?: number | undefined, hostname?: string | undefined, backlog?: number | undefined, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(port: number, hostname?: string | undefined, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(port: number, backlog?: number | undefined, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(port: number, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(path: string, backlog?: number | undefined, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(path: string, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(options: ListenOptions, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(handle: any, backlog?: number | undefined, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
        listen(handle: any, listeningListener?: (() => void) | undefined): NodeServer<typeof IncomingMessage, typeof ServerResponse>;
    }

}