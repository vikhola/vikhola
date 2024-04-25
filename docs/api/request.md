# HttpRequest

HttpRequest provides information about the incoming HTTP request, and it's initialized when an HTTP request is received by the server. 

## Properties

<table>
    <tbody>
        <tr>
            <td>
                <b>ip</b>
            </td>
        </tr>
        <tr>
            <td>
                The "ip" property return an the IP address of the incoming request.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* print: 127.0.0.1
*/
console.log(request.ip);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>raw</b>
            </td>
        </tr>
        <tr>
            <td>
                The "raw" property return the incoming HTTP request from Node.js core.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* print: IncomingMessage {
* ...
*/
console.log(request.raw);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
		<tr>
            <td>
                <b>body</b>
            </td>
        </tr>
        <tr>
            <td>
                The "body" property by default is undefined. If the contents of the request were parsed during "kernel.parse", this property will return a parsed version of it.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* print: undefined
*/
console.log(request.body);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>headers</b>
            </td>
        </tr>
        <tr>
            <td>
                The "headers" property returns a headers collection containing the headers from the incoming request.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* GET / HTTP/1.1
* Foo: Bar
*
* print: { foo: "Bar" }
*/
console.log(request.headers);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>cookies</b>
            </td>
        </tr>
        <tr>
            <td>
                The "cookies" property return an array containing the cookies from the incoming request. 
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
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
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>params</b>
            </td>
        </tr>
        <tr>
            <td>
                The "params" property return router request parameters matching the URL.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* GET /user/john HTTP/1.1
*
* print: john
*/
console.log(request.params.name);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>method</b>
            </td>
        </tr>
        <tr>
            <td>
                The "method" property return a request method: : GET, POST, PUT, and so on.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* GET / HTTP/1.1
*
* print: GET
*/
console.log(request.method);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>socket</b>
            </td>
        </tr>
        <tr>
            <td>
                The "socket"  property return a underlying connection of the incoming request.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* print:  Socket {
*  connecting: false,
*  ...
*/
console.log(request.socket);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>secure</b>
            </td>
        </tr>
        <tr>
            <td>
                The "secure"  property return a boolean value indicating if request secured.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* GET / HTTP/1.1
*  
* print: false
*/
console.log(request.secure);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>protocol</b>
            </td>
        </tr>
        <tr>
            <td>
                The  "protocol" property return a protocol of the incoming request (https or http).
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* GET / HTTP/1.1
*  
* print: http
*/
console.log(request.protocol);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>host</b>
            </td>
        </tr>
        <tr>
            <td>
                The "host" returns the host obtained from the HTTP request headers.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'> 
/**
* localhost:3000
*/
console.log(request.host);
                </pre> 
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>contentType</b>
            </td>
        </tr>
        <tr>
            <td>
                The "contentType" returns the "Content-Type" header obtained from the HTTP request headers. By default undefined.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'> 
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
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>contentLength</b>
            </td>
        </tr>
        <tr>
            <td>
                The "contentLength" returns the "Content-Length" header obtained from the HTTP request headers. By default undefined.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'> 
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
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>originalUrl</b>
            </td>
        </tr>
        <tr>
            <td>
                The  "originalUrl" property return a request original url.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'> 
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
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>path</b>
            </td>
        </tr>
        <tr>
            <td>
                The "path" is a gets and sets the path part of the request URL.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
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
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>querystring</b>
            </td>
        </tr>
        <tr>
            <td>
                The "querystring" is a gets and sets the query part of the request URL.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* GET /login?name=john HTTP/1.1
*
* print: name=john
*/
console.log(request.querystring);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>query</b>
            </td>
        </tr>
        <tr>
            <td>
                The "query" is an object containing a property for each query string parameter in the route.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* GET /login?name=john HTTP/1.1
*
* print: { name: 'john' }
*/
console.log(request.query);
                </pre>
            </td>
        </tr>
	</tbody>
	<tbody>
        <tr>
            <td>
               <b>url</b>
            </td>
        </tr>
        <tr>
            <td>
                The "url" property return URL of the incoming request.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'> 
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
        </tr>
        <tr>
            <td>
                <pre lang='js'> 
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
        </tr>
        <tr>
            <td>
                <pre lang='js'> 
/**
* GET /login?name=ryan HTTP/1.1
*/
request.query = { name: 'bob' };
/**
* print: /login?name=bob
*/
console.log(request.url);
                </pre> 
            </td>
        </tr>
        <tr>
            <td>
                However, changing the "params" property of the request will have no effect. Because this property corresponds logectly to the router.
            </td>
        </tr>
        <tr>
			<td>
            	<pre lang='js'> 
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

## Methods

<table>
	<tbody>
		<tr>
			<td>
				<b>setHeader([name, value][dict])</b>
			</td>
		</tr>
		<tr>
			<td>
				The "setHeader()" method sets one or more header name-value pairs within a header collection. 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
request.setHeader('foo', 'bar');
/**
* print: { foo: 'bar' }
*/
console.log(request.headers);
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				Bulk assignment is done through a dictionary with header name-value pairs.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
request.setHeader({ 'foo': 'bar', 'baz': 'bar' });
/**
* print: { 'foo': 'bar', 'baz': 'bar' }
*/
console.log(request.headers);
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>getHeader(name [, alt])</b>
			</td>
		</tr>
		<tr>
			<td>
				The "getHeader()" method returns a header value by its name. 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
request.setHeader('foo', 'bar');
/**
* print: 'bar'
*/
console.log(request.getHeader('foo'));
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				If primary header name is not present in the collection, method will try to return the value by alternative header name if one is specified.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
request.setHeader('foo', 'bar');
/**
* print: 'bar'
*/
console.log(request.getHeader('baz', 'foo'));
				</pre>
			</td>
		</tr>  	
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>hasHeader(name)</b>
			</td>
		</tr>  	
		<tr>  	
			<td>
				The "hasHeader()" method checks whether a header exists in the header collection and returns a boolean value "true" if it exists and "false" otherwise.
			</td>
		</tr>  	
		<tr>  	
			<td>
				<pre lang='js'>
request.setHeader('foo', 'bar');
/**
* print: true
*/
console.log(request.hasHeader('foo'));
				</pre>
			</td>
		</tr>  
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>removeHeader(name)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "removeHeader()" method removes the specified header by its name from the header collection.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
request.setHeader('foo', 'bar');
request.removeHeader('foo');
/**
* print: false
*/
console.log(request.hasHeader('foo'));
				</pre>
			</td>
		</tr>  
	</tbody>
</table>