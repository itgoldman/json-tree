/**
 *  @brief Prints interactive JSON tree
 *
 *  Original by https://github.com/lmenezes/json-tree
 *  Updated by Itay to include useful settings
 * 
 */
var JSONTree = (function () {


	// private vars
	var escapeMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'/': '&#x2F;'
	};

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

	var id;
	var instances = 0;
	var seen = [];
	var actual_settings = {}

	function extend(obj_base, obj_to_extend) {
		for (var key in obj_to_extend) {
			obj_base[key] = obj_to_extend[key]
		}
	}

	// exports interface
	var JSONTree = {
		create: create,
		toggle: toggle
	}

	return JSONTree;


	function create(data, settings) {
		instances += 1;
		id = 0;
		seen = [];
		settings = settings || {};
		actual_settings = {};

		// COPY from default
		extend(actual_settings, default_settings);

		// APPLY new settings
		extend(actual_settings, settings);

		return _span(_jstVal(data, 0, false), {
			class: 'jstValue'
		});
	}

	function _escape(text) {
		return text.replace(/[&<>'"]/g, function (c) {
			return escapeMap[c];
		});
	}

	function _id() {
		var prefix = actual_settings.prefix || "";
		return prefix + instances + '_' + id++;
	}

	function _jstVal(value, depth, indent) {
		var d = indent ? depth : 0;
		if (value !== null) {
			var type = typeof value;
			switch (type) {
				case 'boolean':
					return _jstBool(value, d);
				case 'number':
					return _jstNum(value, d);
				case 'string':
					return _jstStr(value, d);
				case 'function':
					return _jstFunction(value, depth, indent);
				case 'object':
					if (seen.indexOf(value) >= 0) {
						return _jstRaw("...SEEN...", d, "jstSeen");
					}
					if (_isDOM(value) && !actual_settings.show_dom) {
						return _jstRaw("...DOM...", d, "jstDom");
					}
					if (value instanceof Date) {
						return _jstRaw(JSON.stringify(value), d, "jstDate");
					}

					seen.push(value);

					if (value instanceof Array) {
						return _jstArr(value, depth, indent);
					}

					return _jstObj(value, depth, indent);

				default:
					return _jstRaw(value, d, "jstOther");
			}
		} else {
			return _jstNull(d);
		}
	}

	function _isDOM(object) {
		try {
			return (typeof object === 'object') && (object instanceof Element || object instanceof HTMLDocument)
		} catch (e) {
			return false;
		}
	}

	function _jstArr(object, depth, indent) {
		var d = indent ? depth : 0;
		var pair = ["[", "]"];

		if (object.length === 0) {
			return _jstRaw("[]", d, "jstEmpty");
		}

		// filtering nulls/functions 
		var items = []
		for (var property in object) {
			if (!actual_settings.show_null && object[property] == null) {
				continue
			}
			if (!actual_settings.show_functions && typeof object[property] == 'function') {
				continue
			}
			items.push(object[property])
		}

		var content = items.map(function (element, index) {
			return _jstVal(element, depth + 1, true);
		}).join(_comma());

		var id = _id();
		var attrs = {
			id: id
		};
		if (depth >= actual_settings.collapsed_from_depth) {
			attrs["class"] = "jstHiddenBlock";
		}
		var arr = [
			_openBracket(pair[0], d, id, depth),
			_span(content, attrs),
			_closeBracket(pair[1], depth)
		].join('\n');
		return _span(arr, depth >= actual_settings.collapsed_from_depth ? {
			class: "jstFolded"
		} : {});
	}

	function _jstObj(object, depth, indent) {
		var d = indent ? depth : 0;
		var pair = ["{", "}"];

		if (Object.keys(object).length === 0) {
			return _jstRaw("{}", d, "jstEmpty");
		}

		// filtering nulls/functions 
		var properties = []
		for (var property in object) {
			if (!actual_settings.show_null && object[property] == null) {
				continue
			}
			if (!actual_settings.show_functions && typeof object[property] == 'function') {
				continue
			}
			properties.push(property)
		}

		var content = properties.filter(function (property) {
			return (actual_settings.banned_properties.indexOf(property) == -1)
		}).map(function (property) {
			return _property(property, object[property], depth + 1);
		}).join(_comma());

		var id = _id();
		var attrs = {
			id: id
		};
		if (depth >= actual_settings.collapsed_from_depth) {
			attrs["class"] = "jstHiddenBlock";
		}
		var arr = [
			_openBracket(pair[0], d, id, depth),
			_span(content, attrs),
			_closeBracket(pair[1], depth)
		].join('\n');
		return _span(arr, depth >= actual_settings.collapsed_from_depth ? {
			class: "jstFolded"
		} : {});
	}

	function _jstFunction(value, depth, indent) {
		var d = indent ? depth : 0;
		var id = _id();
		var attrs = {
			id: id
		};
		if (depth >= actual_settings.collapsed_from_depth) {
			attrs["class"] = "jstHiddenBlock";
		}

		var entire = value.toString();
		var signature = 'function' + entire.substring(entire.indexOf('('), entire.indexOf(')') + 1)
		var body = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));

		//var content = _indent(body, depth + 1);
		var arr_body = body.split('\n')
		var content = arr_body.filter(function (line) {
			return (line.trim())
		}).map(function (line) {
			return _indent(_escape(line), depth);
		}).join('\n');

		if (actual_settings.show_execute) {
			var _cb = _closeBracket('} ' + _span('', {
				class: 'jstPlay',
				title: 'Execute'
			}), depth)
		} else {
			var _cb = _closeBracket('}', depth)
		}


		var arr = [
			_openBracket(_span(signature, { class: "jstFunction" }) + ' {', d, id, depth),
			_span(content, attrs),	// can't change attrs for functions' body class bcz of collapse/expand toggle issues
			_cb
		].join('\n');
		return _span(arr, depth >= actual_settings.collapsed_from_depth ? {
			class: "jstFolded"
		} : {});
	}

	function _jstStr(value, depth) {
		var jsonString = _escape(JSON.stringify(value));
		return _span(_indent(jsonString, depth), {
			class: 'jstStr'
		});
	}

	function _jstRaw(value, depth, className) {
		var str = _escape("" + value);
		return _span(_indent(str, depth), {
			class: className || ''
		});
	}

	function _jstNum(value, depth) {
		return _jstRaw(value, depth, "jstNum");
	}

	function _jstBool(value, depth) {
		return _jstRaw(value, depth, "jstBool");
	}

	function _jstNull(depth) {
		return _jstRaw('null', depth, "jstNull");
	}

	function _property(name, value, depth) {
		var property = _indent(_escape(name) + ' : ', depth);
		var propertyValue = _span(_jstVal(value, depth, false), {});
		return _span(property + propertyValue, {
			class: 'jstProperty'
		});
	}

	function _comma() {
		return _span(',\n', {
			class: 'jstComma'
		});
	}

	function _span(value, attrs) {
		return _tag('span', attrs, value);
	}

	function _tag(tag, attrs, content) {
		return '<' + tag + Object.keys(attrs).map(function (attr) {
			if (attrs[attr]) {
				return ' ' + attr + '="' + _escape(attrs[attr]) + '"';
			}
		}).join('') + '>' + content + '</' + tag + '>';
	}

	function _openBracket(symbol, depth, id, actual_depth) {
		return (
			_span(_indent(symbol, depth), {
				class: 'jstBracket jstWSP'
			}) +
			_span('', {
				class: actual_depth >= actual_settings.collapsed_from_depth ? 'jstExpand' : 'jstFold',
				onclick: 'JSONTree.toggle(this.getAttribute("data-jstButtonFor"),event)',
				title: 'Toggle',
				'data-jstButtonFor': id
			})
		);
	}


	function toggle(id, event, force_display) {
		var element = document.getElementById(id);
		var parent = element.parentNode;
		var toggleButton = element.previousElementSibling;
		var showing = false;
		if ((element.className === '' && !force_display) || force_display === false) {
			element.className = 'jstHiddenBlock';
			parent.className = 'jstFolded';
			toggleButton.className = 'jstExpand';
		} else {
			element.className = '';
			parent.className = '';
			toggleButton.className = 'jstFold';
			showing = true;
		}
		if (actual_settings.enable_ctrl_or_shift) {
			var is_all = (event ? event.ctrlKey || event.shiftKey : false);
			if (is_all) {
				var children = element.querySelectorAll("[data-jstButtonFor]");
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					var child_id = child.getAttribute("data-jstButtonFor");
					toggle(child_id, null, showing);
				}
			}
		}
	}

	function _closeBracket(symbol, depth) {
		return _span(_indent(symbol, depth), { class: 'jstBracket' });
	}

	function _indent(value, depth) {
		return Array((depth * actual_settings.indent) + 1).join(' ') + value;
	}


})();