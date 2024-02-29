[mdn]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Trailer#directives

# HttpTrailers

HttpTrailers is a collection of response trailers.

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
				trailers.size
			</td>
			<td>
				The "size" property returns the number of trailer names in trailer collection.
			</td>
			<td>
				<pre>
/**
* print: 0
*/
console.log(trailers.size);
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
				trailers.add(name)
			</td>
			<td>
				The "add()" method declares the name of the trailer inside the trailer collection and it will be added to the "Trailer" response header. This must happen before the response headers are sent.
			</td>
			<td>
				<pre>
trailers.add('foo');
/**
* print: true
*/
console.log(trailers.has('foo'));
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				If trailer name is dissalowed from use such as "Content-Length" header an error will be triggered.
			</td>
			<td>
				<pre>
/**
* will throw an error.
*/
trailers.add('Content-Length');
				</pre>
			</td>
		</tr>  
		<tr>
			<td>
				trailers.has(name)
			</td>
			<td>
				The "has()" method checks whether a trailer exists in the trailer collection and returns a boolean value "true" if it exists and "false" otherwise.
			</td>
			<td>
				<pre>
trailers.add('foo');
/**
* print: true
*/
console.log(trailers.has('foo'));
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				trailers.delete(name)
			</td>
			<td>
				The "delete()" method removes the specified trailer by its name from the trailer collection and returns "true" if the trailer name was deleted, "false" otherwise.
			</td>
			<td>
				<pre>
trailers.add('foo');
/**
* print: true
*/
console.log(trailers.delete('foo'));
/**
* print: false
*/
console.log(trailers.has('foo'));
/**
* print: false
*/
console.log(trailers.delete('foo'));
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				trailers.names()
			</td>
			<td>
				The "names()" method return an array of collection trailer names.
			</td>
			<td>
				<pre>
trailers.add('foo');
/**
* print: [ 'foo' ]
*/
console.log(trailers.names());
				</pre>
			</td>
		</tr>
		<tr>
			<td>
				trailers.clear()
			</td>
			<td>
				The "clear()" method removes all trailers from trailers collection.
			</td>
			<td>
				<pre>
trailers.add('foo');
trailers.clear();
/**
* print: false
*/
console.log(trailers.has('foo'));
				</pre>
			</td>
		</tr>
	</tbody>
</table>