json-tree
=========

simple JS library that creates an html navigable tree from JSON object.

Example
------------

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



