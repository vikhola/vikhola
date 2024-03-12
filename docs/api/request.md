
[headers]: https://github.com/vikhola/vikhola/blob/main/docs/api/headers.md

# HttpRequest

HttpRequest provides information about the incoming HTTP request, and it's initialized when an HTTP request is received by the server. 


## Properties

<table>
    <tbody>
        <tr>
            <th>Property</th>
            <th>Description</th>
            <th>Example</th>
        </tr>
        <tr>
            <td>
                request.ip
            </td>
            <td>
                The "ip" property return an the IP address of the incoming request.
            </td>
            <td>
                <pre>
/**
* print: 127.0.0.1
*/
console.log(request.ip);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.raw
            </td>
            <td>
                The "raw" property return the incoming HTTP request from Node.js core.
            </td>
            <td>
                <pre>
/**
* print: IncomingMessage {
* ...
*/
console.log(request.raw);
                </pre>
            </td>
        </tr>
		<tr>
            <td>
                request.body
            </td>
            <td>
                The "body" property by default is undefined. If the contents of the request were parsed during "kernel.parse", this property will return a parsed version of it.
            </td>
            <td>
                <pre>
/**
* print: undefined
*/
console.log(request.body);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.headers
            </td>
            <td>
                The "headers" property returns a headers collection containing the headers from the incoming request.
            </td>
            <td>
                <pre>
/**
* GET / HTTP/1.1
* Foo: Bar
*
* print: Bar
*/
console.log(request.headers.get('foo'));
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.cookies
            </td>
            <td>
                The "cookies" property return an array containing the cookies from the incoming request. 
            </td>
            <td>
                <pre>
/**
* GET / HTTP/1.1
* Foo: Bar
*
* print: [ 
*  Cookie {
*   ...
*  }
* ]
*/
console.log(request.cookies);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.params
            </td>
            <td>
                The "params" property return router request parameters matching the URL. By default equal to {}.
            </td>
            <td>
                <pre>
/**
* GET /user/john HTTP/1.1
*
* print: john
*/
console.log(request.params.name);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.method
            </td>
            <td>
                The "method" property return a request method: : GET, POST, PUT, and so on.
            </td>
            <td>
                <pre>
/**
* GET / HTTP/1.1
*
* print: GET
*/
console.log(request.method);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.socket
            </td>
            <td>
                The "socket"  property return a underlying connection of the incoming request.
            </td>
            <td>
                <pre>
/**
* print:  Socket {
*  connecting: false,
*  ...
*/
console.log(request.socket);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.secure
            </td>
            <td>
                The "secure"  property return a boolean value indicating if request secured.
            </td>
            <td>
                <pre>
/**
* GET / HTTP/1.1
*  
* print: false
*/
console.log(request.secure);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.protocol
            </td>
            <td>
                The  "protocol" property return a protocol of the incoming request (https or http).
            </td>
            <td>
                <pre>
/**
* GET / HTTP/1.1
*  
* print: http
*/
console.log(request.protocol);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.host
            </td>
            <td>
                The "host" returns the host obtained from the HTTP request headers.
            </td>
            <td>
                <pre> 
/**
* localhost:3000
*/
console.log(request.host);
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                request.contentType
            </td>
            <td>
                The "contentType" returns the "Content-Type" header obtained from the HTTP request headers. By default undefined.
            </td>
            <td>
                <pre> 
/**
* GET /1?name=ryan HTTP/1.1
* Content-Type: 'text/plain'
* Content-Length: 3
*
* print: text/plain
*/
console.log(request.contentType);
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                request.contentLength
            </td>
            <td>
                The "contentLength" returns the "Content-Length" header obtained from the HTTP request headers. By default undefined.
            </td>
            <td>
                <pre> 
/**
* GET /1?name=ryan HTTP/1.1
* Content-Type: 'text/plain'
* Content-Length: 3
*
* print: 3
*/
console.log(request.contentLength);
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                request.originalUrl
            </td>
            <td>
                The  "originalUrl" property return a request original url.
            </td>
            <td>
                <pre> 
/**
* GET /1?name=ryan HTTP/1.1
* Content-Type: 'text/plain'
* Content-Length: 3
*
* print: /1?name=ryan
*/
console.log(request.url);
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                request.path
            </td>
            <td>
                The "path" is a gets and sets the path part of the request URL.
            </td>
            <td>
                <pre>
/**
* GET /login?name=john HTTP/1.1
*
* print: /login
*/
console.log(request.path);
request.path = '/logout'
/**
* print: /logout
*/
console.log(request.path);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.querystring
            </td>
            <td>
                The "querystring" is a gets and sets the query part of the request URL.
            </td>
            <td>
                <pre>
/**
* GET /login?name=john HTTP/1.1
*
* print: name=john
*/
console.log(request.querystring);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                request.query
            </td>
            <td>
                The "query" is an object containing a property for each query string parameter in the route.
            </td>
            <td>
                <pre>
/**
* GET /login?name=john HTTP/1.1
*
* print: { name: 'john' }
*/
console.log(request.query);
                </pre>
            </td>
        </tr>
        <tr>
            <td rowspan=4>
                request.url
            </td>
            <td>
                The "url" property return URL of the incoming request.
            </td>
            <td>
                <pre> 
/**
* GET /login?name=john HTTP/1.1
*
* print: /login?name=john
*/
console.log(request.url);
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                Changing of "path", "query" and "querystring" also affects the request URL.
            </td>
            <td>
                <pre> 
/**
* GET /login?name=ryan HTTP/1.1
*/
request.path = '/logout';
/**
* print: /logout?name=ryan
*/
console.log(request.url)
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                Same effect will be with request "querystring" or in this case with "query".
            </td>
            <td>
                <pre> 
/**
* GET /login?name=ryan HTTP/1.1
*/
request.query = { name: 'bob' };
/**
* print: /logout?name=bob
*/
console.log(request.url);
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                However, changing the "params" property of the request will have no effect. Because this property corresponds logectly to the router.
            </td>
        <td>
            <pre> 
/**
* GET /1?name=ryan HTTP/1.1
*/
request.params.id = 2;
/**
* print: /1?name=ryan HTTP/1.1
*/
console.log(request.url);
            </pre> 
        </td>
    </tr>
    </tbody>
</table>