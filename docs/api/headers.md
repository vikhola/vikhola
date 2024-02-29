# HttpHeaders

HttpHeaders is a collection of HTTP headers.

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
				headers.size
			</td>
			<td>
				The "size" property returns the number of headers in headers collection.
			</td>
			<td>
				<pre>
/**
 * print: 0
 */
console.log(headers.size);
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
			<td rowspan=2>
				headers.set([name, value][dict])
			</td>
			<td>
				The "set()" method sets one or more header name-value pairs within a header collection. 
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
/**
* print: 'bar'
*/
console.log(headers.get('foo'));
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				Bulk assignment is done through a dictionary with header name-value pairs.
			</td>
			<td>
				<pre>
headers.set({ 'foo': 'bar', 'baz': 'bar' });
/**
* print: 'bar' x2
*/
console.log(headers.get('foo'));
console.log(headers.get('baz'));
				</pre>
			</td>
		</tr>
		<tr>
			<td rowspan=2>
				headers.get(name [, alt])
			</td>
			<td>
				The "get()" method returns a header value by its name. 
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
/**
* print: 'bar'
*/
console.log(headers.get('foo'));
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				If primary header name is not present in the collection, method will try to return the value by alternative header name if one is specified.
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
/**
* print: 'bar'
*/
console.log(headers.get('baz', 'foo'));
				</pre>
			</td>
		</tr>  	
		<tr>
			<td>
				headers.has(name)
			</td>
			<td>
				The "has()" method checks whether a header exists in the header collection and returns a boolean value "true" if it exists and "false" otherwise.
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
/**
* print: true
*/
console.log(headers.has('foo'));
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				headers.delete(name)
			</td>
			<td>
				The "delete()" method removes the specified header by its name from the trailer collection and returns "true" if the trailer name was deleted, "false" otherwise.
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
headers.delete('foo');
/**
* print: false
*/
console.log(headers.has('foo'));
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				headers.names()
			</td>
			<td>
				The "names()" method return an array of collection header names.
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
/**
* print: [ 'foo' ]
*/
console.log(headers.names());
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				headers.values()
			</td>
			<td>
				The "values()" method return an array of collection header values.
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
/**
* print: [ 'bar' ]
*/
console.log(headers.values());
				</pre>
			</td>
		</tr> 
		<tr>
			<td>
				headers.clear()
			</td>
			<td>
				The "clear()" method removes all headers from this collection.
			</td>
			<td>
				<pre>
headers.set('foo', 'bar');
headers.clear();
/**
* print: false
*/
console.log(headers.has('foo'));
				</pre>
			</td>
		</tr> 
	</tbody>
</table>
