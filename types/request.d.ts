import { IncomingMessage } from 'http'
import { IHttpHeaders } from './headers'
import { Cookie } from '@vikhola/cookies'

export interface IHttpRequest {
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
     * The `headers` property returns a collection containing the headers from the incoming request.
     */
    readonly headers: IHttpHeaders
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
     * 
     * @default undefined
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