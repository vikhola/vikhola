[serialization]: https://github.com/vikhola/vikhola/blob/main/docs/guides/serialize.md
[lifecycle]: https://github.com/vikhola/vikhola/blob/main/docs/guides/lifecycle.md
[mdn]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Trailer#directives

# HttpResponse

HttpResponse is used to set information on the HTTP response sent back to the client.

## Properties

<table>
    <tbody>
        <tr>
            <td>
                <b>raw</b>
            </td>
        </tr> 
        <tr> 
            <td>
                The "raw" property return the HTTP response from Node.js core.
            </td>
        </tr>
        <tr>  
            <td>
                <pre lang='js'>
/**
* print: ServerResponse {
*  ...
*/
console.log(response.raw);
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
                The "cookies" property is a cookie collection that will be sent to the end user.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
response.cookies.push(new Cookie('foo', 'bar'));
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
                The "headers" property returns a headers collection containing the headers that will be sent to the end user.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* {}
*/
console.log(response.headers);
                </pre>
            </td>
        </tr> 
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>trailers</b>
            </td>
        </tr>
        <tr>  
            <td>
                The "trailers" property returns a trailer names collection containing the trailers that will be sent to the end user.
            </td>
        </tr>
        <tr>  
            <td>
                <pre lang='js'>
/**
* []
*/
console.log(response.trailers);
                </pre>
            </td>
        </tr> 
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>sent</b>
            </td>
        </tr>
        <tr>
            <td>
                The "sent" property indicates if the underlying response instance has completed writing.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
/**
* print: false
*/
console.log(response.sent);
response.raw.end()
/**
* print: true
*/
console.log(response.sent);
                </pre>
            </td>
        </tr> 
	</tbody>
	<tbody>
        <tr>
            <td>
                <b>statusCode</b>
            </td>
        </tr> 
        <tr> 
            <td>
                The "statusCode" field is gets and sets the HTTP status for the response. By default it is 200.
            </td>
        </tr>
        <tr>  
            <td>
                <pre lang='js'>
/**
* print: 200
*/
console.log(response.statusCode);
response.statusCode = 404
/**
* print: 404
*/
console.log(response.statusCode);
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
                The "contentType" property is gets and sets the response "Content-Type" header.
            </td>
        </tr> 
        <tr> 
            <td>
                <pre lang='js'>
response.contentType = 'text/plain';
/**
* print: text/plain
*/
console.log(response.getHeader('Content-Type'));
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                If "null" is provided, removes the "Content-Type" header.
            </td>
        </tr> 
        <tr> 
            <td>
                <pre lang='js'>
response.contentType = null;
/**
* print: undefined
*/
console.log(response.getHeader('Content-Type'));
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
                The "contentLength" property is gets and sets the response "Content-Length" header.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
response.contentLength = 3;
/**
* print: 3
*/
console.log(response.getHeader('Content-Length'));
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                If "null" is provided, removes the "Content-Length" header.
            </td>
        </tr> 
        <tr> 
            <td>
                <pre lang='js'>
response.contentLength = null;
/**
* print: undefined
*/ 
console.log(response.getHeader('Content-Length'));
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
                The response "body" gets the payload that will be sent to the end user.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
response.send('foo');
/**
* print: foo
*/ 
console.log(response.body);
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
response.setHeader('foo', 'bar');
/**
* print: { foo: 'bar' }
*/
console.log(response.headers);
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
response.setHeader({ 'foo': 'bar', 'baz': 'bar' });
/**
* print: { 'foo': 'bar', 'baz': 'bar' }
*/
console.log(response.headers);
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
response.setHeader('foo', 'bar');
/**
* print: 'bar'
*/
console.log(response.getHeader('foo'));
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
response.setHeader('foo', 'bar');
/**
* print: 'bar'
*/
console.log(response.getHeader('baz', 'foo'));
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
response.setHeader('foo', 'bar');
/**
* print: true
*/
console.log(response.hasHeader('foo'));
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
response.setHeader('foo', 'bar');
response.removeHeader('foo');
/**
* print: false
*/
console.log(response.hasHeader('foo'));
				</pre>
			</td>
		</tr>  
	</tbody>
    <tbody>
        <tr>
            <td>
                <b>send([body])</b>
            </td>
        </tr>
        <tr>
            <td>
                The "send()" method interrupts the lifecycle request and push it depending on its position to the response or to the writing stages with an optional body.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
response.send('foo');
/**
* print: foo
*/ 
console.log(response.body);
                </pre>
            </td>
        </tr>
		<tr>
			<td>
              This method except body also may affect the response "contentType" property, when the response "Content-Type" header is not set, its value will be set to the default body type.
            </td>
		</tr>
		<tr>
			<td>
				<table>
 					<tr>
            			<td>
                			<b>text</b>
           				</td>
            			<td>
							text/plain; charset=utf-8
            			</td>
        			</tr>
					<tr>
            			<td>
                			<b>HTML</b>
           				</td>
            			<td>
							text/html; charset=utf-8
            			</td>
        			</tr>
        			<tr>
            			<td>
                			<b>buffer</b>
            			</td>
            			<td>
							application/octet-stream
            			</td>
       				</tr>
        			<tr>
            			<td>
                			<b>stream</b>
            			</td>
            			<td>
							application/octet-stream
						</td>
        			</tr>
        			<tr>
            			<td>
                			<b>JSON</b>
            			</td>
            			<td>
               				application/json; charset=utf-8.
            			</td>
        			</tr>
				</table>
			</td>
		</tr>
		<tr>
            <td>
When "null" value is provided from the response will be removed except body also "Content-Type", "Content-Length" and "Transfer-Encoding" headers.
            </td>
        </tr>  
		<tr>
            <td>
                <pre lang='js'>
response.contentType = 'text/plain'
response.send(null)
/**
* print: undefined
*/ 
console.log(response.contentType);
                </pre>
            </td>
        </tr>
	</tbody>
    <tbody>
        <tr>
            <td>
                <b>redirect(path)</b>
            </td>
        </tr>
        <tr>
            <td>
                Sets the response "Location" header to the specified URL and optionally sets default status code to "302".
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
response.redirect('/home');
/**
* print: /home 302
*/ 
console.log(
    response.getHeader('Location'), 
    response.statusCode
);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                The "statusCode" response will only be set if it was not previously set.
            </td>
        </tr>
        <tr>
            <td>
                <pre lang='js'>
response.statusCode = 304;
response.redirect('/home');
/**
* print: /home 304
*/ 
console.log(
    response.getHeader('Location'), 
    response.statusCode
);
                </pre>
            </td>
        </tr>
    </tbody>
	<tbody>
		<tr>
			<td>
				<b>addTrailer(name)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "addTrailer()" method declares the name of the trailer inside the trailer collection and it will be added to the "Trailer" response header. This must happen before the response headers are sent.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
response.addTrailer('foo');
/**
* print: [ 'foo' ]
*/
console.log(response.trailers);
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				If trailer name is dissalowed from use such as "Content-Length" header an error will be triggered.
			</td>
		</tr>  
		<tr>  
			<td>
				<pre lang='js'>
/**
* will throw an error.
*/
response.addTrailer('Content-Length');
				</pre>
			</td>
		</tr>  
    </tbody>
	<tbody>
		<tr>
			<td>
				<b>hasTrailer(name)</b>
			</td>
		</tr>  
		<tr>  
			<td>
				The "hasTrailer()" method checks whether a trailer exists in the trailer collection and returns a boolean value "true" if it exists and "false" otherwise.
			</td>
		</tr>  
		<tr>  
			<td>
				<pre lang='js'>
response.addTrailer('foo');
/**
* print: true
*/
console.log(response.hasTrailer('foo'));
				</pre>
			</td>
		</tr>
    </tbody>
	<tbody>
		<tr>
			<td>
				<b>removeTrailer(name)</b>
			</td>
		</tr>  
		<tr>  
			<td>
				The "removeTrailer()" method removes the specified trailer from the trailer collection.
			</td>
		</tr>  
		<tr>  
			<td>
				<pre lang='js'>
response.addTrailer('foo');
response.removeTrailer('foo');
/**
* print: false
*/
console.log(response.hasTrailer('foo'));
				</pre>
			</td>
		</tr>
	</tbody>
</table>