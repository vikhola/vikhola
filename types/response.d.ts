import { ServerResponse } from 'http'
import { IHttpHeaders } from './headers'
import { IHttpTrailers } from './trailers'
import { Cookie } from '@vikhola/cookies'

export interface IHttpResponse {
    /**
     * The `raw` property is the http.ServerResponse instance from Node.js core.
     */
    readonly raw: ServerResponse
    /**
     * The `headers` property returns a collection containing the headers that will be sent to the end user.
     */
    readonly headers: IHttpHeaders
    /**
     * The `cookies` property is a cookie collection that will be sent to the end user.
     */
    readonly cookies: Array<Cookie>
    /**
     * The `trailer` property returns a response trailers.
     */
    readonly trailers: IHttpTrailers
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
     * The `clear()` method clear a response body, headers, cookies and trailers.
     * 
     * @throws Error if `contentLength` is not type of number.
     */
    clear(): void
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