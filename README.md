# json-tree


simple JS library that creates an html navigable tree from JSON object.

## Example

```html
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8" />
	<title>json tree example</title>
	<link href="src/jsontree.css" rel="stylesheet">
	<script src="src/jsontree.js"></script>
</head>

<body>
	<div id="example"></div>
	<script>
		var obj = {
			"foo": "bar",
			"foos": ["b", "a", "r"],
			"bar": {
				"foo": "bar",
				"bar": false,
				"foobar": 1234
			},
			"null": null,
			"undefined": undefined,
		}

		// add some challenging properties
		obj.foo_identity = function (x) { return x };
		obj.self = obj
		obj.now = new Date();
		obj.container = document.getElementById("example")

		var html_json = JSONTree.create(obj)

		document.getElementById("example").innerHTML = html_json
	</script>
</body>

</html>
```
### Full view

![example 1](imgs/example_1.png)

### Collapsed view

![example 2](imgs/example_2.png)


## Settings
you can and should pass settings object as second argument to function. see source code for possible/ default settings:
```js
var default_settings = {
	indent: 4,
	collapsed_from_depth: 0,
	prefix: "jstBlock_",
	enable_ctrl_or_shift: true,
	show_null: true,
	show_functions: true,
	show_execute: false,
	show_dom: false,
	banned_properties: []
}
```	



## Features:
* selectable text (without the "+" and "-" buttons which are pseudo-elements)
* beautifies JSON tree
* cyclical reference defense 
* prints functions
* small footprint 
* no external dependencies
* configurable settings

and more.

enjoy.




