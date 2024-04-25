# HttpFeatures

The HttpFeatures provides access to the collection of features for the current request. This collection can be used by event listeners to modify the collection and add support for additional features. 

## Methods

<table>
	<tbody>
		<tr>
			<td>
				<b>set(name, feature)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "set()" method sets name-value pair within a feature collection. 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
event.features.set('foo', 'bar');
				</pre>
			</td>
		</tr>  
	</tbody>	
	<tbody>
		<tr>
			<td>
				<b>get(name)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "get()" method returns a feature by its name. 
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
event.features.set('foo', 'bar');
/**
* print: 'bar'
*/
console.log(event.features.get('foo'));
				</pre>
			</td>
		</tr>
	</tbody>
	<tbody>
		<tr>
			<td>
				<b>has(name)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "has()" method checks whether a feature exists in the collection and returns a boolean value "true" if it exists and "false" otherwise.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
/**
* print: false
*/
event.features.has('foo');
				</pre>
			</td>
		</tr>
	</tbody>	
	<tbody>
		<tr>
			<td>
				<b>remove(name)</b>
			</td>
		</tr>
		<tr>
			<td>
				The "remove()" method removes the specified feature by its name from the features collection.
			</td>
		</tr>
		<tr>
			<td>
				<pre lang='js'>
event.features.set('foo', 'bar');
event.features.remove('foo');
/**
* print: false
*/
event.features.has('foo');
				</pre>
			</td>
		</tr>
	</tbody>
</table>