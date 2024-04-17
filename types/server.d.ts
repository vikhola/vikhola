import { ListenOptions } from 'net'
import { IncomingMessage, Server, ServerResponse } from 'http'
import { IEmitter } from "./target";
import { IHttpRequest } from './request';
import { IHttpResponse } from './response';

type THTTPMethod = | 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' | 'M-SEARCH' | 'MERGE' | 'MKACTIVITY' | 'MKCALENDAR' | 'MKCOL' | 'MOVE' | 'NOTIFY' | 'OPTIONS' | 'PATCH'| 'POST'| 'PROPFIND'| 'PROPPATCH'| 'PURGE'| 'PUT'| 'REBIND'| 'REPORT'| 'SEARCH'| 'SOURCE'| 'SUBSCRIBE'| 'TRACE'| 'UNBIND'| 'UNLINK'| 'UNLOCK'| 'UNSUBSCRIBE';

type THandler = (this: IEmitter, request: IHttpRequest, response: IHttpResponse) => any;

export interface IServer extends IEmitter {
    /**
     * The `get()` method register handler function for specific http path with an `GET` method.
     */
    get(path: string, handler: THandler): IEmitter
    /**
     * The `head()` method register handler function for specific http path with an `HEAD` method.
     */
    head(path: string, handler: THandler): IEmitter
    /**
     * The `post()` method register handler function for specific http path with an `POST` method.
     */
    post(path: string, handler: THandler): IEmitter
    /**
     * The `put()` method register handler function for specific http path with an `PUT` method.
     */
    put(path: string, handler: THandler): IEmitter    
    /**
     * The `delete()` method register handler function for specific http path with an `DELETE` method.
     */
    delete(path: string, handler: THandler): IEmitter
    /**
     * The `options()` method register handler function for specific http path with an `OPTIONS` method.
     */  
    options(path: string, handler: THandler): IEmitter
    /**
     * The `patch()` method register handler function for specific http path with an `PATCH` method.
     */   
    patch(path: string, handler: THandler): IEmitter
    /**
     * The `route` method register handler function fro specific method, path.
     */
    route(method: THTTPMethod, route: string, handler: THandler): IEmitter
    /**
     * The `callback()` method return callback that handle a Node.js core request.
     */
    callback(): (request: IncomingMessage, response: ServerResponse) => Promise<void>
    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): Server;
    listen(port: number, hostname?: string, listeningListener?: () => void): Server;
    listen(port: number, backlog?: number, listeningListener?: () => void): Server;
    listen(port: number, listeningListener?: () => void): Server;
    listen(path: string, backlog?: number, listeningListener?: () => void): Server;
    listen(path: string, listeningListener?: () => void): Server;
    listen(options: ListenOptions, listeningListener?: () => void): Server;
    listen(handle: any, backlog?: number, listeningListener?: () => void): Server;
    listen(handle: any, listeningListener?: () => void): Server;
}