
[headers]: https://github.com/vikhola/vikhola/blob/main/docs/api/headers.md
[trailers]: https://github.com/vikhola/vikhola/blob/main/docs/api/trailers.md
[serialization]: https://github.com/vikhola/vikhola/blob/main/docs/guides/serialize.md
[lifecycle]: https://github.com/vikhola/vikhola/blob/main/docs/guides/lifecycle.md

# HttpResponse

HttpResponse is used to set information on the HTTP response sent back to the client.

## Properties

<table>
    <tbody>
        <tr>
            <th>Property </th>
            <th>Description</th>
            <th>Example</th>
        </tr>
        <tr>
            <td>
                response.raw
            </td>
            <td>
                The "raw" property return the HTTP response from Node.js core.
            </td>
            <td>
                <pre>
/**
* print: ServerResponse {
*  ...
*/
console.log(response.raw);
                </pre>
            </td>
        </tr>  
        <tr>
            <td>
                request.cookies
            </td>
            <td>
                The "cookies" property is a cookie collection that will be sent to the end user.
            </td>
            <td>
                <pre>
response.cookies.push(new Cookie('foo', 'bar'));
                </pre>
            </td>
        </tr> 
        <tr>
            <td>
                response.headers
            </td>
            <td>
                The "headers" property returns a headers collection containing the headers that will be sent to the end user.
            </td>
            <td>
                <pre>
response.headers.set('foo', 'bar');
                </pre>
            </td>
        </tr> 
        <tr>
            <td>
                response.trailers
            </td>
            <td>
                The "trailers" property returns a trailers collection containing the trailers that will be sent to the end user.
            </td>
            <td>
                <pre>
response.trailers.add('foo');
                </pre>
            </td>
        </tr> 
        <tr>
            <td>
                response.sent
            </td>
            <td>
                The "sent" property indicates if the underlying response instance has completed writing.
            </td>
            <td>
                <pre>
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
        <tr>
            <td>
                response.statusCode
            </td>
            <td>
                The "statusCode" field is gets and sets the HTTP status for the response. By default it is 200.
            </td>
            <td>
                <pre>
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
        <tr>
            <td rowspan=2>
                response.contentType
            </td>
            <td>
                The "contentType" property is gets and sets the response "Content-Type" header.
            </td>
            <td>
                <pre>
response.contentType = 'text/plain';
/**
* print: text/plain
*/
console.log(response.headers.get('Content-Type'));
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                If "null" is provided, removes the "Content-Type" header.
            </td>
            <td>
                <pre>
                response.contentType = null;
/**
* print: undefined
*/
console.log(response.headers.get('Content-Type'));
                </pre>
            </td>
        </tr>
        <tr>
            <td rowspan=2>
                response.contentLength
            </td>
            <td>
                The "contentLength" property is gets and sets the response "Content-Length" header.
            </td>
            <td>
                <pre>
                response.contentLength = 3;
/**
* print: 3
*/
console.log(response.headers.get('Content-Length'));
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                If "null" is provided, removes the "Content-Length" header.
            </td>
            <td>
                <pre>
                response.contentLength = null;
/**
* print: undefined
*/ 
console.log(response.headers.get('Content-Length'));
                </pre> 
            </td>
        </tr>
        <tr>
            <td rowspan=6>
                response.body
            </td>
            <td>
                The response "body" gets the payload that will be sent to the end user.
            </td>
            <td>
                <pre>
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
            <th>Method</th>
            <th>Description</th>
            <th>Example</th>
        </tr>
        <tr>
            <td rowspan=7>
                response.send([body])
            </td>
            <td>
                The "send()" method interrupts the lifecycle request and push it depending on its position to the response or to the writing stages with an optional body.
            </td>
            <td>
                <pre>
response.send('foo');
/**
* print: foo
*/ 
console.log(response.body);
                </pre>
            </td>
        </tr>
		<tr>
			<td colspan=2>
              This method except body property also may affect the response "contentType" field, when the response "Content-Type" header is not set, its value will be set to the default body type.
            </td>
		</tr>
		<tr>
            <td>
            "null"
            </td>
            <td>
                In the case of "null" from the response will be removed "Content-Type", "Content-Length" and "Transfer-Encoding" headers.
            </td>
        </tr>  
 		<tr>
            <td>
                "String"
            </td>
            <td>
                The "contentType" will defaulted to "text/plain; charset=utf-8". Except situation when body is "HTML" string, then it will be set to "text/html; charset=utf-8". 
            </td>
        </tr>
        <tr>
            <td>
                "Buffer"
            </td>
            <td>
                The "contentType" will defaulted to "application/octet-stream".
            </td>
        </tr>
        <tr>
            <td>
                "Stream"
            </td>
            <td>
                The "contentType" will defaulted just as with buffer to "application/octet-stream".
        </tr>
        <tr>
            <td>
                "JSON"
            </td>
            <td>
                The "contentType" will defaulted to "application/json; charset=utf-8". This type of body also trigger serialization event.
            </td>
        </tr>
        <tr>
            <td rowspan=2>
                response.redirect(path)
            </td>
            <td>
                Sets the response "Location" header to the specified URL and optionally sets default status code to "302".
            </td>
            <td>
                <pre>
response.redirect('/home');
/**
* print: /home 302
*/ 
console.log(
    response.headers.get('Location'), 
    response.statusCode
);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                The "statusCode" response will only be set if it was not previously set.
            </td>
            <td>
                <pre>
response.statusCode = 304;
response.redirect('/home');
/**
* print: /home 304
*/ 
console.log(
    response.headers.get('Location'), 
    response.statusCode
);
                </pre>
            </td>
        </tr>
        <tr>
            <td>
                response.clear()
            </td>
            <td>
                As the name suggests, method clear response instance "body", "headers", "cookies" and "trailers".
            </td>
            <td>
                <pre>
response.headers.set('foo', 'bar');
response.trailers.set('foo', 'bar');
response.body = 'foo';
response.clear();
/**
* print: undefined
*/ 
console.log(response.body);
/**
* print: 0
*/ 
console.log(response.headers.size);
/**
* print: 0
*/ 
console.log(response.trailers.size);
                </pre>
            </td>
        </tr>
    </tbody>
</table>