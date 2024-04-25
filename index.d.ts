declare module "vikhola" {

    import { Config } from "find-my-way";
    import { Cookie } from "@vikhola/cookies"
    import { ListenOptions } from "net";
    import { ListenerOptions } from "@vikhola/events";
    import { IncomingMessage, Server as NodeServer, ServerResponse } from "http";

    type ServerOptions = Pick<Config<any>, 'allowUnsafeRegex' | 'caseSensitive' | 'ignoreDuplicateSlashes' | 'ignoreTrailingSlash' | 'maxParamLength' >
    type FeatureName = string | Symbol
    type EventListener<T = KernelEvent> = (this: KernelEmitter, event: T) => any
    type HttpHeaderValue = NonNullable<unknown>
    type HttpHeaders = { [key: string]: HttpHeaderValue }
    type RawEventListener = { priority: number; listener: EventListener } 
    type HTTPMethod = | 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' | 'M-SEARCH' | 'MERGE' | 'MKACTIVITY' | 'MKCALENDAR' | 'MKCOL' | 'MOVE' | 'NOTIFY' | 'OPTIONS' | 'PATCH'| 'POST'| 'PROPFIND'| 'PROPPATCH'| 'PURGE'| 'PUT'| 'REBIND'| 'REPORT'| 'SEARCH'| 'SOURCE'| 'SUBSCRIBE'| 'TRACE'| 'UNBIND'| 'UNLINK'| 'UNLOCK'| 'UNSUBSCRIBE';
    type Controller = (this: KernelEmitter, context: HttpContext) => any;

    interface HttpContext {
        target: KernelEmitter
        request: HttpRequest
        response: HttpResponse
        features: HttpFeatures
    }

    interface HttpFeatures {
        /**
         * The `set()` method adds or updates feature in this collection.
         * 
         * @throws Error if feature `name` is not type of string or symbol.
         */
        set(name: FeatureName, value: any): this
        /**
         * The `has()` method checks whether a feature with the specified `name` exists in this collection.
         */
        has(name: FeatureName): boolean
        /**
         * The 'get()' method returns a feature by its name.
         */
        get<T = any>(name: FeatureName): T | undefined
        /**
         * The `remove()` method removes the specified feature by its name from this colllection. 
         */
        remove(name: FeatureName): undefined
    }

    interface HttpMessage {
        /**
         * The `headers` property returns a collection containing current headers.
         */
        readonly headers: HttpHeaders
        /**
         * The `setHeader()` method adds or updates one or more headers.
         * 
         * @throws Error if header `name` is not type of string or is empty.
         * @throws Error if header `value` is null or undefined.
         */
        setHeader(name: string, value: HttpHeaderValue): this
        setHeader(name: HttpHeaders): this
        /**
         * The `hasHeader()` method checks whether a header with the specified `name` exists.
         */
        hasHeader(name: string): boolean
        /**
         * The 'getHeader()' method returns a header value by its name.
         * 
         * If primary header name is not present, method will try to return the value by alternative header name if one is specified.
         */
        getHeader<T = HttpHeaderValue>(name: string, alt?: string): T | undefined
        /**
         * The `removeHeader()` method removes the specified header by its name. 
         */
        removeHeader(name: string): this 
    }

    interface HttpRequest extends HttpMessage {
        /**
         * The `ip` property return a request socket remove address.
         */
        readonly ip: string
        /**
         * The `raw` property is the http.IncomingMessage instance from Node.js core.
         */
        readonly raw: IncomingMessage
        /**
         * The `body` property return a request body.
         */
        readonly body: unknown
        /**
         * The `params` property return a request params matching the URL.
         */
        readonly params: { [k: string]: string | undefined }
        /**
         * The `cookies` property return a cookie collection from the incoming request.
         */
        readonly cookies: Array<Cookie>
        /**
         * The `method` property return a request method.
         */
        readonly method: string
        /**
         * The `socket` property return a underlying connection of the incoming request.
         */
        readonly socket: IncomingMessage['socket']
        /**
         * The `protocol` property return a protocol of the incoming request (https or http).
         */
        readonly protocol: 'http' | 'https'
        /**
         * The `secure` property return boolean value indicating if request secured.
         */
        readonly secure: boolean
        /**
         * The `originalUrl` property return a request original url.
         */
        readonly originalUrl: string
        /**
         * The `host` returns the host obtained from the HTTP request headers.
         */
        readonly host?: string
        /**
         * The `contentType` returns the `Content-Type` header obtained from the HTTP request headers.
         */
        readonly contentType?: string
        /**
         * The `contentType` returns the `Content-Type` header obtained from the HTTP request headers. 
         * 
         * @default undefined
         */
        readonly contentLength?: number
        /**
         * The `url` property return URL of the incoming request.
         */
        url: string
        /**
         * The `path` is a getter and setter for the path part of the request URL.
         * 
         * Overriding this property also affects request `url`.
         */
        path: string
        /**
         * The `query` is an object containing a property for each query string parameter in the route.
         * 
         * Overriding this property also affects request `url`.
         */
        query: { [k: string]: string | undefined }
        /**
         * The `querystring` is a getter and setter for the query part of the request URL.
         * 
         * Overriding this property also affects request `url`.
         */
        querystring: string 
    }

    interface HttpResponse extends HttpMessage {
        /**
         * The `raw` property is the http.ServerResponse instance from Node.js core.
         */
        readonly raw: ServerResponse
        /**
         * The `cookies` property is a cookie collection that will be sent to the end user.
         */
        readonly cookies: Array<Cookie>
        /**
         * The `trailer` property returns a response trailers collection.
         */
        readonly trailers: Array<string>
        /**
         * The `sent` property indicates if the underlying response instance has completed writing.
         */
        readonly sent: boolean
        /**
         * The `body` property gets a response body.
         */
        readonly body: unknown
        /**
         * The `statusCode` is getter and setter for the HTTP status for the response.
         * 
         * @throws Error if `statusCode` is not type of number.
         * @throws Error if `statusCode` outside 100-999 range.
         * @default 200
         */
        statusCode: Number
        /**
         * The `contentType` is getter and setter for the response `Content-Type` header.
         * 
         * If `null` is provided, removes the `Content-Type` header.
         * 
         * If the response `Content-Type` header is not present but there is a response body, then property will return its default content-type. 
         */
        contentType?: string | null
        /**
         * The `contentLength` is getter and setter for the response `Content-Length` header.
         * 
         * If `null` is provided, removes the `Content-Length` header.
         */
        contentLength?: number | null
        /**
         * The `addTrailer()` method declares the name of the trailer that will be added to the `Trailer` response header. 
         * 
         * @throws Error if response is already sent.
         * @throws Error if trailer `name` is not type of string, empty or is restricted.
         * @throws Error if header `value` is null or undefined.
         */
        addTrailer(name: string): this
        /**
         * The `hasTrailer()` method checks whether a trailer with the specified name is declared.
         * 
         * @returns Method returns `true` if trailer with the specified name is present, `false` otherwise.
         */
        hasTrailer(name: string): boolean
        /**
         * The `removeTrailer()` method removes the specified trailer. 
         */
        removeTrailer(name: string): this 
        /**
         * The `redirect()` method sets the response `Location` header to provided url. 
         * 
         * If the `statusCode` of the response is not present, sets it to `302`.
         */
        redirect(url: string): this
        /**
         * The `send()` method sends the response and its optional body to the client side.
         * 
         * @param body body could be any type but if null or undefined is provided, then except body will be removed `Content-Type`, `Content-Length` and `Transfer-Encoding` headers.
         */
        send(body?: any): void
    }

    interface KernelEvent {
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
        /**
         * The `captureRejection` property specifies whether event errors will be captured or not.
         */
        captureRejection?: boolean
    }

    interface KernelEmitter {
        on(eventName: "kernel.request", listener: EventListener<RequestEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.parse", listener: EventListener<ParseEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.controller", listener: EventListener<ControllerEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.response", listener: EventListener<ResponseEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.serialize", listener: EventListener<SerializeEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.trailers", listener: EventListener<TrailersEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.error", listener: EventListener<ErrorEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.warning", listener: EventListener<WarningEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.critical", listener: EventListener<CriticalEvent>, options?: ListenerOptions): this
        on(eventName: "kernel.finish", listener: EventListener<FinishEvent>, options?: ListenerOptions): this
        on<T>(eventName: string | symbol, listener: EventListener<T>, options?: ListenerOptions): this
        listeners(eventName: string | symbol): Array<EventListener> 
        eventNames(): (string | symbol)[];
        rawListeners(eventName: string | symbol): Array<RawEventListener>
        listenerCount(eventName: string | symbol): number;
        removeAllListeners(eventName?: string | symbol): this 
        off(eventName: string | symbol, listener: EventListener): this
        emit(event: KernelEvent): boolean | Promise<boolean>
    }

    interface HttpEvent {
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
        readonly target: KernelEmitter
    }

    interface RequestEvent extends HttpEvent {
        readonly name: "kernel.request"
        /**
         * The `request` property return current context request.
         */
        readonly request: HttpRequest
        /**
         * The `response` property return current context response.
         */
        readonly response: HttpResponse
        /**
         * The `feature` property return current context features.
         */
        readonly features: HttpFeatures
    }

    interface ControllerEvent extends HttpEvent {
        readonly name: "kernel.controller"
        /**
         * The `request` property return current context request.
         */
        readonly request: HttpRequest
        /**
         * The `response` property return current context response.
         */
        readonly response: HttpResponse
        /**
         * The `feature` property return current context features.
         */
        readonly features: HttpFeatures
    }

    interface ResponseEvent extends HttpEvent {
        readonly name: "kernel.response"
        /**
         * The `request` property return current context request.
         */
        readonly request: HttpRequest
        /**
         * The `response` property return current context response.
         */
        readonly response: HttpResponse
        /**
         * The `feature` property return current context features.
         */
        readonly features: HttpFeatures
    }

    interface FinishEvent extends HttpEvent {
        readonly name: "kernel.finish"
        /**
         * The `request` property return current context request.
         */
        readonly request: HttpRequest
        /**
         * The `response` property return current context response.
         */
        readonly response: HttpResponse
        /**
         * The `feature` property return current context features.
         */
        readonly features: HttpFeatures
        /**
         * The `captureRejection` property specifies whether event errors will be captured or not.
         */
        readonly captureRejection: true
    }

    interface ErrorEvent extends HttpEvent {
        readonly name: "kernel.error"
        /**
         * The `request` property return current context request.
         */
        readonly request: HttpRequest
        /**
         * The `response` property return current context response.
         */
        readonly response: HttpResponse
        /**
         * The `feature` property return current context features.
         */
        readonly features: HttpFeatures
        /**
         * The `error` property returns the error that caused the event to trigger.
         */
        readonly error: Error
    }

    interface WarningEvent extends HttpEvent {
        readonly name: "kernel.warning"
        /**
         * The `error` property returns the error that caused the event to trigger.
         */
        readonly error: Error
    }

    interface CriticalEvent extends HttpEvent {
        readonly name: "kernel.critical"
        /**
         * The `error` property returns the error that caused the event to trigger.
         */
        readonly error: Error
    }

    interface ParseEvent extends HttpEvent {
        readonly name: "kernel.parse"
        /**
         * The `request` property return current context request.
         */
        readonly request: HttpRequest
        /**
         * The `body` gets and sets the request body.
         */
        body: unknown
    }

    interface SerializeEvent extends HttpEvent {
        readonly name: "kernel.serialize"
        /**
         * The `response` property return current context response.
         */
        readonly response: HttpResponse
        /**
         * The `body` gets and sets the response body.
         */
        body: unknown
    }

    interface TrailersEvent extends HttpEvent {
        readonly name: "kernel.trailers"
        /**
         * The `response` property return current context response.
         */
        readonly response: HttpResponse
        /**
         * The `trailers` property return the response trailers.
         */
        readonly trailers: { [k: string]: any }
    }

    interface HttpServer extends KernelEmitter {
        /**
         * The `get()` method register handler function for specific http path with an `GET` method.
         */
        get(path: string, handler: Controller): KernelEmitter
        /**
         * The `head()` method register handler function for specific http path with an `HEAD` method.
         */
        head(path: string, handler: Controller): KernelEmitter
        /**
         * The `post()` method register handler function for specific http path with an `POST` method.
         */
        post(path: string, handler: Controller): KernelEmitter
        /**
         * The `put()` method register handler function for specific http path with an `PUT` method.
         */
        put(path: string, handler: Controller): KernelEmitter    
        /**
         * The `delete()` method register handler function for specific http path with an `DELETE` method.
         */
        delete(path: string, handler: Controller): KernelEmitter
        /**
         * The `options()` method register handler function for specific http path with an `OPTIONS` method.
         */  
        options(path: string, handler: Controller): KernelEmitter
        /**
         * The `patch()` method register handler function for specific http path with an `PATCH` method.
         */   
        patch(path: string, handler: Controller): KernelEmitter
        /**
         * The `route` method register handler function fro specific method, path.
         */
        route(method: HTTPMethod, route: string, handler: Controller): KernelEmitter
        /**
         * The `callback()` method return callback that handle a Node.js core request.
         */
        callback(): (request: IncomingMessage, response: ServerResponse) => Promise<void>
        listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): NodeServer;
        listen(port: number, hostname?: string, listeningListener?: () => void): NodeServer;
        listen(port: number, backlog?: number, listeningListener?: () => void): NodeServer;
        listen(port: number, listeningListener?: () => void): NodeServer;
        listen(path: string, backlog?: number, listeningListener?: () => void): NodeServer;
        listen(path: string, listeningListener?: () => void): NodeServer;
        listen(options: ListenOptions, listeningListener?: () => void): NodeServer;
        listen(handle: any, backlog?: number, listeningListener?: () => void): NodeServer;
        listen(handle: any, listeningListener?: () => void): NodeServer;
    }
    
    class Server implements HttpServer {
        /**
         * @param options.caseSensitive When `true` routes are registered as case-sensitive.
         * @param options.allowUnsafeRegex When `true` allows unsafe expressions
         * @param options.ignoreTrailingSlash When `true` allows to both /foo and /foo/ point to the same route.
         * @param options.ignoreDuplicateSlashes When `true` removes duplicate slashes from the path. 
         * @param options.maxParamLength Length for parameters in parametric (standard, regex, and multi) routes.
         */
        constructor(options?: ServerOptions)
    
        get(path: string, handler: Controller): KernelEmitter;
        post(path: string, handler: Controller): KernelEmitter;
        put(path: string, handler: Controller): KernelEmitter;
        delete(path: string, handler: Controller): KernelEmitter;
        head(path: string, handler: Controller): KernelEmitter;
        options(path: string, handler: Controller): KernelEmitter;
        patch(path: string, handler: Controller): KernelEmitter;
        route(method: HTTPMethod, route: string, handler: Controller): KernelEmitter;
    
        on(eventName: "kernel.request", listener: EventListener<RequestEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.parse", listener: EventListener<ParseEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.controller", listener: EventListener<ControllerEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.response", listener: EventListener<ResponseEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.serialize", listener: EventListener<SerializeEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.trailers", listener: EventListener<TrailersEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.error", listener: EventListener<ErrorEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.warning", listener: EventListener<WarningEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.critical", listener: EventListener<CriticalEvent>, options?: ListenerOptions | undefined): this;
        on(eventName: "kernel.finish", listener: EventListener<FinishEvent>, options?: ListenerOptions | undefined): this;
        on<T>(eventName: string | symbol, listener: EventListener<T>, options?: ListenerOptions | undefined): this;
        off(eventName: string | symbol, listener: EventListener<KernelEvent>): this;
        eventNames(): (string | symbol)[];
        listeners(eventName: string | symbol): EventListener<KernelEvent>[];
        rawListeners(eventName: string | symbol): RawEventListener[];
        listenerCount(eventName: string | symbol): number;
        removeAllListeners(eventName?: string | symbol | undefined): this;
        emit(event: KernelEvent): boolean | Promise<boolean>;
        
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