'use strict';

/** BUDDY BUILT **/

if ('undefined' === typeof self) var self = this;
if ('undefined' === typeof global) var global = self;
var $m = self.$m = self.$m || {};
if ('browser' != 'browser') {
  var $req = require;
  require = function buddyRequire (id) {
    if (!$m[id]) return $req(id);
    if ('function' == typeof $m[id]) $m[id]();
    return $m[id].exports;
  };
} else {
  if ('undefined' === typeof process) var process = {browser:true, env:{NODE_ENV:'development'}};
  self.require = self.require || function buddyRequire (id) {
    if ($m[id]) {
      if ('function' == typeof $m[id]) $m[id]();
      return $m[id].exports;
    }

    if ('development' == 'development') {
      console.warn('module ' + id + ' not found');
    }
  };
}
(function (global) {
  var babelHelpers = global.babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  babelHelpers.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };
})(typeof global === "undefined" ? self : global);

(function () {
/*== node_modules/@yr/runtime/index.js ==*/
$m['@yr/runtime'] = { exports: {} };

/**
 * Determine if the current runtime is server or browser
 * https://github.com/yr/runtime
 * @copyright Yr
 * @license MIT
 */

var yrruntime__isServer = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
var yrruntime__isBrowser = typeof window !== 'undefined';

$m['@yr/runtime'].exports.isServer = yrruntime__isServer;
$m['@yr/runtime'].exports.isBrowser = !yrruntime__isServer && yrruntime__isBrowser;
$m['@yr/runtime'].exports.isWorker = !yrruntime__isServer && !yrruntime__isBrowser;
/*≠≠ node_modules/@yr/runtime/index.js ≠≠*/


/*== node_modules/strict-uri-encode/index.js ==*/
$m['strict-uri-encode'] = { exports: {} };
$m['strict-uri-encode'].exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};
/*≠≠ node_modules/strict-uri-encode/index.js ≠≠*/


/*== node_modules/cookie/index.js ==*/
$m['cookie'] = { exports: {} };
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

$m['cookie'].exports.parse = cookie__parse;
$m['cookie'].exports.serialize = cookie__serialize;

/**
 * Module variables.
 * @private
 */

var cookie__decode = decodeURIComponent;
var cookie__encode = encodeURIComponent;
var cookie__pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var cookie__fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function cookie__parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(cookie__pairSplitRegExp);
  var dec = opt.decode || cookie__decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = cookie__tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function cookie__serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || cookie__encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!cookie__fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !cookie__fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!cookie__fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!cookie__fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function cookie__tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}
/*≠≠ node_modules/cookie/index.js ≠≠*/


/*== node_modules/eventemitter3/index.js ==*/
$m['eventemitter3'] = { exports: {} };

var eventemitter3__has = Object.prototype.hasOwnProperty,
    eventemitter3__prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function eventemitter3__Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  eventemitter3__Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new eventemitter3__Events().__proto__) eventemitter3__prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function eventemitter3__EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function eventemitter3__EventEmitter() {
  this._events = new eventemitter3__Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
eventemitter3__EventEmitter.prototype.eventNames = function eventNames() {
  var names = [],
      events,
      name;

  if (this._eventsCount === 0) return names;

  for (name in events = this._events) {
    if (eventemitter3__has.call(events, name)) names.push(eventemitter3__prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
eventemitter3__EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = eventemitter3__prefix ? eventemitter3__prefix + event : event,
      available = this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
eventemitter3__EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = eventemitter3__prefix ? eventemitter3__prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;
      case 2:
        return listeners.fn.call(listeners.context, a1), true;
      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;
      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
        j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);break;
        case 2:
          listeners[i].fn.call(listeners[i].context, a1);break;
        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);break;
        case 4:
          listeners[i].fn.call(listeners[i].context, a1, a2, a3);break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
eventemitter3__EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new eventemitter3__EE(fn, context || this),
      evt = eventemitter3__prefix ? eventemitter3__prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
eventemitter3__EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new eventemitter3__EE(fn, context || this, true),
      evt = eventemitter3__prefix ? eventemitter3__prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;else if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
eventemitter3__EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = eventemitter3__prefix ? eventemitter3__prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    if (--this._eventsCount === 0) this._events = new eventemitter3__Events();else delete this._events[evt];
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
      if (--this._eventsCount === 0) this._events = new eventemitter3__Events();else delete this._events[evt];
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else if (--this._eventsCount === 0) this._events = new eventemitter3__Events();else delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
eventemitter3__EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = eventemitter3__prefix ? eventemitter3__prefix + event : event;
    if (this._events[evt]) {
      if (--this._eventsCount === 0) this._events = new eventemitter3__Events();else delete this._events[evt];
    }
  } else {
    this._events = new eventemitter3__Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
eventemitter3__EventEmitter.prototype.off = eventemitter3__EventEmitter.prototype.removeListener;
eventemitter3__EventEmitter.prototype.addListener = eventemitter3__EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
eventemitter3__EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
eventemitter3__EventEmitter.prefixed = eventemitter3__prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
eventemitter3__EventEmitter.EventEmitter = eventemitter3__EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof $m['eventemitter3']) {
  $m['eventemitter3'].exports = eventemitter3__EventEmitter;
}
/*≠≠ node_modules/eventemitter3/index.js ≠≠*/


/*== node_modules/ms/index.js ==*/
$m['ms'] = { exports: {} };
/**
 * Helpers.
 */

var ms__s = 1000;
var ms__m = ms__s * 60;
var ms__h = ms__m * 60;
var ms__d = ms__h * 24;
var ms__y = ms__d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

$m['ms'].exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return ms__parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? ms__fmtLong(val) : ms__fmtShort(val);
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function ms__parse(str) {
  str = String(str);
  if (str.length > 10000) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * ms__y;
    case 'days':
    case 'day':
    case 'd':
      return n * ms__d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * ms__h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * ms__m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * ms__s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function ms__fmtShort(ms) {
  if (ms >= ms__d) {
    return Math.round(ms / ms__d) + 'd';
  }
  if (ms >= ms__h) {
    return Math.round(ms / ms__h) + 'h';
  }
  if (ms >= ms__m) {
    return Math.round(ms / ms__m) + 'm';
  }
  if (ms >= ms__s) {
    return Math.round(ms / ms__s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function ms__fmtLong(ms) {
  return ms__plural(ms, ms__d, 'day') || ms__plural(ms, ms__h, 'hour') || ms__plural(ms, ms__m, 'minute') || ms__plural(ms, ms__s, 'second') || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function ms__plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}
/*≠≠ node_modules/ms/index.js ≠≠*/


/*== node_modules/object-assign/index.js ==*/
$m['object-assign'] = { exports: {} };
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

/* eslint-disable no-unused-vars */
var objectassign__getOwnPropertySymbols = Object.getOwnPropertySymbols;
var objectassign__hasOwnProperty = Object.prototype.hasOwnProperty;
var objectassign__propIsEnumerable = Object.prototype.propertyIsEnumerable;

function objectassign__toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function objectassign__shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

$m['object-assign'].exports = objectassign__shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = objectassign__toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (objectassign__hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (objectassign__getOwnPropertySymbols) {
			symbols = objectassign__getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (objectassign__propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};
/*≠≠ node_modules/object-assign/index.js ≠≠*/


/*== node_modules/isarray/index.js ==*/
$m['isarray'] = { exports: {} };
$m['isarray'].exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};
/*≠≠ node_modules/isarray/index.js ≠≠*/


/*== node_modules/@yr/url-utils/index.js ==*/
$m['@yr/url-utils'] = { exports: {} };

/**
 * URL/path utilities
 * https://github.com/yr/url-utils
 * @copyright Yr
 * @license MIT
 */

var yrurlutils__isServer = $m['@yr/runtime'].exports.isServer;

var yrurlutils__RE_TEMPLATE = /\{([0-9a-zA-Z]+)\}/g;
var yrurlutils__RE_URL = /([^:])(\/{2,})/g;

/**
 * Join url segments
 * Handles strings or arrays of strings
 * @returns {String}
 */
$m['@yr/url-utils'].exports.join = function () {
  var leading = '';
  var path = [];

  function add(seg) {
    if (seg) {
      // Handle leading slash
      if (seg.charAt(0) == '/') {
        // Keep if first segment
        if (!path.length) leading = '/';
        seg = seg.slice(1);
      }
      if (seg.length) path.push($m['@yr/url-utils'].exports.sanitize(seg));
    }
  }

  for (var _len = arguments.length, segments = Array(_len), _key = 0; _key < _len; _key++) {
    segments[_key] = arguments[_key];
  }

  if (segments.length) {
    segments.forEach(function (segment) {
      // Handle array
      if (Array.isArray(segment)) {
        segment.forEach(add);
      } else {
        add(segment);
      }
    });

    return leading + path.join('/');
  }

  return '';
};

/**
 * Add query parameters to url in alphabetical order
 * Handles undefined query parameters
 * @param {String} url
 * @param {Object} query
 * @returns {String}
 */
$m['@yr/url-utils'].exports.query = function (url, query) {
  var delimit = '?';
  var sorted = [];

  function append(q) {
    if (url.charAt(url.length - 1) != delimit) url += '&';
    url += q + '=' + query[q];
  }

  if (url && query) {
    url = $m['@yr/url-utils'].exports.sanitize(url);
    sorted = Object.keys(query).sort();
    if (!sorted.length) return '';
    // Add delimiter
    url += delimit;
    // Append queries
    sorted.forEach(function (q) {
      if (query[q] != null) append(q);
    });

    return $m['@yr/url-utils'].exports.encode(url);
  }

  return '';
};

/**
 * Remove trailing '/' from 'url'
 * @param {String} url
 * @returns {String}
 */
$m['@yr/url-utils'].exports.sanitize = function (url) {
  if (url && url != '/') {
    url = url.replace(yrurlutils__RE_URL, '$1/');
    if (url.charAt(url.length - 1) == '/') url = url.slice(0, -1);
  }

  return url || '';
};

/**
 * Decode 'url'
 * @param {String} url
 * @returns {String}
 */
$m['@yr/url-utils'].exports.decode = function (url) {
  if ('string' == typeof url) {
    try {
      url = decodeURI(url);
    } catch (err) {
      url = '';
    }
  }

  return url;
};

/**
 * Encode 'url'
 * @param {String} url
 * @returns {String}
 */
$m['@yr/url-utils'].exports.encode = function (url) {
  if ('string' == typeof url) {
    try {
      // Try to decode first in-case url is encoded
      try {
        url = decodeURI(url);
      } catch (err) {
        // Do nothing
      }
      url = encodeURI(url);
    } catch (err) {
      url = '';
    }
  }

  return url;
};

/**
 * Retrieve current browser path
 * @returns {String}
 */
$m['@yr/url-utils'].exports.getCurrent = function () {
  return !yrurlutils__isServer ? $m['@yr/url-utils'].exports.encode(window.location.pathname + window.location.search + window.location.hash) : '';
};

/**
 * Substitute 'data' values in 'str' template
 * @param {String} str
 * @param {Object} data
 * @param {Object} [options]
 * @returns {String}
 */
$m['@yr/url-utils'].exports.template = function (str, data) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  str = String(str).replace(yrurlutils__RE_TEMPLATE, function (match, prop, idx) {
    return data && data[prop] != null ? data[prop] : options.loose ? match : '';
  });

  return $m['@yr/url-utils'].exports.sanitize(str);
};
/*≠≠ node_modules/@yr/url-utils/index.js ≠≠*/


/*== node_modules/path-to-regexp/index.js ==*/
$m['path-to-regexp'] = { exports: {} };
var pathtoregexp__isarray = $m['isarray'].exports;

/**
 * Expose `pathToRegexp`.
 */
$m['path-to-regexp'].exports = pathtoregexp__pathToRegexp;
$m['path-to-regexp'].exports.parse = pathtoregexp__parse;
$m['path-to-regexp'].exports.compile = pathtoregexp__compile;
$m['path-to-regexp'].exports.tokensToFunction = pathtoregexp__tokensToFunction;
$m['path-to-regexp'].exports.tokensToRegExp = pathtoregexp__tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var pathtoregexp__PATH_REGEXP = new RegExp([
// Match escaped characters that would otherwise appear in future matches.
// This allows the user to escape special characters that won't transform.
'(\\\\.)',
// Match Express-style parameters and un-named parameters with a prefix
// and optional suffixes. Matches appear as:
//
// "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
// "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
// "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
'([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function pathtoregexp__parse(str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = pathtoregexp__PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue;
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? pathtoregexp__escapeGroup(pattern) : asterisk ? '.*' : '[^' + pathtoregexp__escapeString(delimiter) + ']+?'
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens;
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function pathtoregexp__compile(str, options) {
  return pathtoregexp__tokensToFunction(pathtoregexp__parse(str, options));
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function pathtoregexp__encodeURIComponentPretty(str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function pathtoregexp__encodeAsterisk(str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function pathtoregexp__tokensToFunction(tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? pathtoregexp__encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue;
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue;
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined');
        }
      }

      if (pathtoregexp__isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`');
        }

        if (value.length === 0) {
          if (token.optional) {
            continue;
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty');
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`');
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue;
      }

      segment = token.asterisk ? pathtoregexp__encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"');
      }

      path += token.prefix + segment;
    }

    return path;
  };
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function pathtoregexp__escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function pathtoregexp__escapeGroup(group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function pathtoregexp__attachKeys(re, keys) {
  re.keys = keys;
  return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function pathtoregexp__flags(options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function pathtoregexp__regexpToRegexp(path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return pathtoregexp__attachKeys(path, keys);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function pathtoregexp__arrayToRegexp(path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathtoregexp__pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', pathtoregexp__flags(options));

  return pathtoregexp__attachKeys(regexp, keys);
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function pathtoregexp__stringToRegexp(path, keys, options) {
  return pathtoregexp__tokensToRegExp(pathtoregexp__parse(path, options), keys, options);
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function pathtoregexp__tokensToRegExp(tokens, keys, options) {
  if (!pathtoregexp__isarray(keys)) {
    options = /** @type {!Object} */keys || options;
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += pathtoregexp__escapeString(token);
    } else {
      var prefix = pathtoregexp__escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = pathtoregexp__escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return pathtoregexp__attachKeys(new RegExp('^' + route, pathtoregexp__flags(options)), keys);
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathtoregexp__pathToRegexp(path, keys, options) {
  if (!pathtoregexp__isarray(keys)) {
    options = /** @type {!Object} */keys || options;
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return pathtoregexp__regexpToRegexp(path, /** @type {!Array} */keys);
  }

  if (pathtoregexp__isarray(path)) {
    return pathtoregexp__arrayToRegexp( /** @type {!Array} */path, /** @type {!Array} */keys, options);
  }

  return pathtoregexp__stringToRegexp( /** @type {string} */path, /** @type {!Array} */keys, options);
}
/*≠≠ node_modules/path-to-regexp/index.js ≠≠*/


/*== src/lib/layer.js ==*/
$m['src/lib/layer'] = { exports: {} };

var srcliblayer__matcher = $m['path-to-regexp'].exports;
var srcliblayer__urlUtils = $m['@yr/url-utils'].exports;

var srcliblayer__Layer = function () {
  /**
   * Constructor
   * @param {String} path
   * @param {Function} fn
   * @param {Object} options
   */
  function srcliblayer__Layer(path, fn, options) {
    babelHelpers.classCallCheck(this, srcliblayer__Layer);

    // To be filled by matcher
    this.keys = [];
    this.path = null;
    this.params = null;
    this.fn = fn;
    this.name = fn.name ? '<' + fn.name + '>' : '<anonymous>';
    this.fastmatch = path == '/' && !options.end;
    this.regexp = srcliblayer__matcher(path, this.keys, options);
  }

  /**
   * Determine if this route matches 'path'
   * @param {String} path
   * @returns {Boolean}
   */


  srcliblayer__Layer.prototype.match = function match(path) {
    if (this.fastmatch) {
      this.params = {};
      this.path = '';
      return true;
    }

    var mtch = this.regexp.exec(path);

    if (!mtch) {
      this.params = null;
      this.path = null;
      return false;
    }

    this.params = {};
    this.path = mtch[0];

    var n = 0;
    var key = void 0,
        val = void 0;

    for (var i = 1, len = mtch.length; i < len; ++i) {
      key = this.keys[i - 1];
      val = srcliblayer__urlUtils.decode(mtch[i]);

      if (key) {
        this.params[key.name] = val;
      } else {
        this.params[n++] = val;
      }
    }

    return true;
  };

  /**
   * Handle error
   * @param {Error} err
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @returns {null}
   */


  srcliblayer__Layer.prototype.handleError = function handleError(err, req, res, next) {
    // Only call if it handles errors
    if (this.fn.length !== 4) return next(err);

    try {
      this.fn(err, req, res, next);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Handle
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @returns {null}
   */


  srcliblayer__Layer.prototype.handleRequest = function handleRequest(req, res, next) {
    // Skip if error handler
    if (this.fn.length > 3) return next();

    try {
      this.fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };

  return srcliblayer__Layer;
}();

/**
 * Instance Factory
 * @param {String} path
 * @param {Function} fn
 * @param {Object} options
 * @returns {Layer}
 */


$m['src/lib/layer'].exports = function (path, fn, options) {
  return new srcliblayer__Layer(path, fn, options);
};
/*≠≠ src/lib/layer.js ≠≠*/


/*== node_modules/debug/src/debug.js ==*/
$m['debug/src/debug'] = { exports: {} };

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

$m['debug/src/debug'].exports = $m['debug/src/debug'].exports = debugsrcdebug__createDebug.debug = debugsrcdebug__createDebug.default = debugsrcdebug__createDebug;
$m['debug/src/debug'].exports.coerce = debugsrcdebug__coerce;
$m['debug/src/debug'].exports.disable = debugsrcdebug__disable;
$m['debug/src/debug'].exports.enable = debugsrcdebug__enable;
$m['debug/src/debug'].exports.enabled = debugsrcdebug__enabled;
$m['debug/src/debug'].exports.humanize = $m['ms'].exports;

/**
 * The currently active debug mode names, and names to skip.
 */

$m['debug/src/debug'].exports.names = [];
$m['debug/src/debug'].exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

$m['debug/src/debug'].exports.formatters = {};

/**
 * Previous log timestamp.
 */

var debugsrcdebug__prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function debugsrcdebug__selectColor(namespace) {
  var hash = 0,
      i;

  for (i in namespace) {
    hash = (hash << 5) - hash + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return $m['debug/src/debug'].exports.colors[Math.abs(hash) % $m['debug/src/debug'].exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debugsrcdebug__createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (debugsrcdebug__prevTime || curr);
    self.diff = ms;
    self.prev = debugsrcdebug__prevTime;
    self.curr = curr;
    debugsrcdebug__prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = $m['debug/src/debug'].exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = $m['debug/src/debug'].exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    $m['debug/src/debug'].exports.formatArgs.call(self, args);

    var logFn = debug.log || $m['debug/src/debug'].exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = $m['debug/src/debug'].exports.enabled(namespace);
  debug.useColors = $m['debug/src/debug'].exports.useColors();
  debug.color = debugsrcdebug__selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof $m['debug/src/debug'].exports.init) {
    $m['debug/src/debug'].exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function debugsrcdebug__enable(namespaces) {
  $m['debug/src/debug'].exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      $m['debug/src/debug'].exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      $m['debug/src/debug'].exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function debugsrcdebug__disable() {
  $m['debug/src/debug'].exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function debugsrcdebug__enabled(name) {
  var i, len;
  for (i = 0, len = $m['debug/src/debug'].exports.skips.length; i < len; i++) {
    if ($m['debug/src/debug'].exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = $m['debug/src/debug'].exports.names.length; i < len; i++) {
    if ($m['debug/src/debug'].exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function debugsrcdebug__coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
/*≠≠ node_modules/debug/src/debug.js ≠≠*/


/*== node_modules/debug/src/browser.js ==*/
$m['debug'] = { exports: {} };
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

$m['debug'].exports = $m['debug'].exports = $m['debug/src/debug'].exports;
$m['debug'].exports.log = debug__log;
$m['debug'].exports.formatArgs = debug__formatArgs;
$m['debug'].exports.save = debug__save;
$m['debug'].exports.load = debug__load;
$m['debug'].exports.useColors = debug__useColors;
$m['debug'].exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : debug__localstorage();

/**
 * Colors.
 */

$m['debug'].exports.colors = ['lightseagreen', 'forestgreen', 'goldenrod', 'dodgerblue', 'darkorchid', 'crimson'];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function debug__useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style ||
  // is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window && window.console && (console.firebug || console.exception && console.table) ||
  // is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 ||
  // double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

$m['debug'].exports.formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function debug__formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + $m['debug'].exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function debug__log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function debug__save(namespaces) {
  try {
    if (null == namespaces) {
      $m['debug'].exports.storage.removeItem('debug');
    } else {
      $m['debug'].exports.storage.debug = namespaces;
    }
  } catch (e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function debug__load() {
  try {
    return $m['debug'].exports.storage.debug;
  } catch (e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

$m['debug'].exports.enable(debug__load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function debug__localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
/*≠≠ node_modules/debug/src/browser.js ≠≠*/


/*== src/lib/router.js ==*/
$m['src/lib/router'] = { exports: {} };

var srclibrouter__assign = $m['object-assign'].exports;
var srclibrouter__Debug = $m['debug'].exports;
var srclibrouter__layer = $m['src/lib/layer'].exports;
var srclibrouter__urlUtils = $m['@yr/url-utils'].exports;

var srclibrouter__DEFAULT_OPTIONS = {
  mergeParams: true,
  caseSensitive: false,
  strict: false
};

var srclibrouter__debug = srclibrouter__Debug('express:router');

var srclibrouter__Router = function () {
  /**
   * Constructor
   * @param {Object} [options]
   */
  function srclibrouter__Router(options) {
    babelHelpers.classCallCheck(this, srclibrouter__Router);

    options = srclibrouter__assign({}, srclibrouter__DEFAULT_OPTIONS, options);

    var boundMethod = this.method.bind(this);

    this.all = boundMethod;
    this.get = boundMethod;
    this.post = boundMethod;
    this.handle = this.handle.bind(this);
    this.stack = [];
    this.mergeParams = options.mergeParams;
    // Init matcher options
    this.matcherOpts = {
      sensitive: options.caseSensitive,
      strict: options.strict,
      end: false
    };
    this.strictMatcherOpts = {
      sensitive: options.caseSensitive,
      strict: options.strict,
      end: true
    };
    this.params = null;
  }

  /**
   * Handle param 'name' with 'fn'
   * @param {String} name
   * @param {Function} fn(req, res, next, value)
   */


  srclibrouter__Router.prototype.param = function param(name, fn) {
    if (!this.params) this.params = {};
    this.params[name] = fn;
  };

  /**
   * Add one or more 'fn' to middleware pipeline at optional 'path'
   */


  srclibrouter__Router.prototype.use = function use() {
    var _this = this;

    var offset = 0;
    var path = '/';

    for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    if ('string' == typeof fns[0]) {
      offset = 1;
      path = fns[0];
    }

    fns.slice(offset).forEach(function (fn) {
      if (fn instanceof srclibrouter__Router) {
        fn = fn.handle;
      }
      var lyr = srclibrouter__layer(path, fn, _this.matcherOpts);

      srclibrouter__debug('adding router middleware %s with path %s', lyr.name, path);
      _this.stack.push(lyr);
    });
  };

  /**
   * Register method at 'path'
   * @param {String} path
   */


  srclibrouter__Router.prototype.method = function method(path) {
    var _this2 = this;

    for (var _len2 = arguments.length, fns = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      fns[_key2 - 1] = arguments[_key2];
    }

    fns.forEach(function (fn) {
      var lyr = srclibrouter__layer(path, fn, _this2.strictMatcherOpts);

      lyr.route = true;

      srclibrouter__debug('adding router route %s with path %s', lyr.name, path);
      _this2.stack.push(lyr);
    });
  };

  /**
   * Run request/response through middleware pipline
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done
   */


  srclibrouter__Router.prototype.handle = function handle(req, res, done) {
    var self = this;
    var parentUrl = req.baseUrl || '';
    var idx = 0;
    var processedParams = {};
    var removed = '';

    // Update done to restore req props
    done = srclibrouter__restore(done, req, 'baseUrl', 'next', 'params');

    // Setup next layer
    req.next = next;
    req.baseUrl = parentUrl;

    next();

    function next(err) {
      var lyr = self.stack[idx++];
      var layerErr = err;

      if (removed.length != 0) {
        srclibrouter__debug('untrim %s from url %s', removed, req.path);
        req.baseUrl = parentUrl;
        req.path = srclibrouter__urlUtils.join(removed, req.path);
        removed = '';
      }

      // Exit
      if (!lyr) return done(layerErr);

      // Skip if no match or err and route layer
      if (!lyr.match(req.path) || layerErr && !lyr.fastmatch) return next(layerErr);

      srclibrouter__debug('%s matched layer %s with path %s', req.path, lyr.name, lyr.path);

      // Store params
      if (self.mergeParams) {
        if (!req.params) req.params = {};
        srclibrouter__assign(req.params, lyr.params);
      } else {
        req.params = lyr.params;
      }

      // Process params if necessary
      self._processParams(processedParams, req.params, Object.keys(lyr.params), req, res, function (err) {
        if (err) return next(layerErr || err);
        if (!lyr.route) trim(lyr);
        if (layerErr) {
          lyr.handleError(layerErr, req, res, next);
        } else {
          lyr.handleRequest(req, res, next);
        }
      });
    }

    function trim(layer) {
      if (layer.path.length != 0) {
        srclibrouter__debug('trim %s from url %s', layer.path, req.path);
        removed = layer.path;
        req.path = req.path.substr(removed.length);
        if (req.path.charAt(0) != '/') req.path = '/' + req.path;

        req.baseUrl = srclibrouter__urlUtils.join(parentUrl, removed);
      }
    }
  };

  /**
   * Process middleware matched parameters
   * @param {Object} processedParams
   * @param {Object} params
   * @param {Array} keys
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done(err)
   */


  srclibrouter__Router.prototype._processParams = function _processParams(processedParams, params, keys, req, res, done) {
    var self = this;
    var idx = 0;

    function next(err) {
      // Stop processing on any error
      if (err) return done(err);

      if (idx >= keys.length) return done();

      var name = keys[idx++];
      var fn = self.params[name];

      // Process if match and not already processed
      if (fn && !processedParams[name]) {
        processedParams[name] = true;
        fn(req, res, next, params[name]);
      } else {
        next();
      }
    }

    if (this.params && keys.length) {
      next();
    } else {
      done();
    }
  };

  return srclibrouter__Router;
}();

/**
 * Restore 'obj' props
 * @param {Function} fn
 * @param {Object} obj
 * @returns {Function}
 */


function srclibrouter__restore(fn, obj) {
  var props = new Array(arguments.length - 2);
  var vals = new Array(arguments.length - 2);

  for (var i = 0; i < props.length; i++) {
    props[i] = arguments[i + 2];
    vals[i] = obj[props[i]];
  }

  return function () {
    // Restore vals
    for (var _i = 0; _i < props.length; _i++) {
      obj[props[_i]] = vals[_i];
    }

    return fn.apply(this, arguments);
  };
}

/**
 * Instance factory
 * @param {Object} [options]
 * @returns {Router}
 */
$m['src/lib/router'].exports = function (options) {
  return new srclibrouter__Router(options);
};
/*≠≠ src/lib/router.js ≠≠*/


/*== src/lib/response.js ==*/
$m['src/lib/response'] = { exports: {} };

var srclibresponse__assign = $m['object-assign'].exports;
var srclibresponse__cookieLib = $m['cookie'].exports;
var srclibresponse__Emitter = $m['eventemitter3'].exports;

var srclibresponse__Response = function (_srclibresponse__Emit) {
  babelHelpers.inherits(srclibresponse__Response, _srclibresponse__Emit);

  /**
   * Constructor
   * @param {Request} req
   */
  function srclibresponse__Response(req) {
    babelHelpers.classCallCheck(this, srclibresponse__Response);

    var _this = babelHelpers.possibleConstructorReturn(this, _srclibresponse__Emit.call(this));

    _this.app = null;
    _this.cached = false;
    _this.finished = false;
    _this.locals = {};
    _this.req = req;
    _this.statusCode = 404;
    return _this;
  }

  /**
   * Set cookie
   * @param {String} name
   * @param {String|Object} val
   * @param {Object} options
   * @returns {Response}
   */


  srclibresponse__Response.prototype.cookie = function cookie(name, val, options) {
    // Clone
    options = srclibresponse__assign({}, options);

    if ('number' == typeof val) val = val.toString();
    if ('object' == typeof val) val = 'j:' + JSON.stringify(val);

    if ('maxAge' in options) {
      options.expires = new Date(Date.now() + options.maxAge);
      options.maxAge /= 1000;
    }

    if (options.path == null) options.path = '/';

    document.cookie = srclibresponse__cookieLib.serialize(name, String(val), options);

    return this;
  };

  /**
   * Set status 'code'
   * @param {Number} code
   * @returns {Response}
   */


  srclibresponse__Response.prototype.status = function status(code) {
    this.statusCode = code;
    return this;
  };

  /**
   * Send response
   */


  srclibresponse__Response.prototype.send = function send() {
    this.end();
  };

  /**
   * End response (last method called in pipeline)
   */


  srclibresponse__Response.prototype.end = function end() {
    // Reset state
    this.req && this.req.reset();
    this.status(200);
    this.finished = true;
    this.emit('finish');
  };

  /**
   * Partial response (noop)
   */


  srclibresponse__Response.prototype.write = function write() {};

  /**
   * Redirect to 'url'
   * @param {Number} statusCode
   * @param {String} url
   */


  srclibresponse__Response.prototype.redirect = function redirect(statusCode, url) {
    this.app.redirectTo(url || statusCode);
  };

  /**
   * Reset state
   */


  srclibresponse__Response.prototype.reset = function reset() {
    this.cached = false;
    this.finished = false;
    this.locals = {};
    this.req = null;
    this.statusCode = 404;
  };

  /**
   * Abort response
   */


  srclibresponse__Response.prototype.abort = function abort() {
    this.req && this.req.abort();
    this.reset();
    this.emit('close');
  };

  return srclibresponse__Response;
}(srclibresponse__Emitter);

/**
 * Instance factory
 * @returns {Response}
 */


$m['src/lib/response'].exports = function () {
  return new srclibresponse__Response();
};
$m['src/lib/response'].exports.Response = srclibresponse__Response;
/*≠≠ src/lib/response.js ≠≠*/


/*== node_modules/query-string/index.js ==*/
$m['query-string'] = { exports: {} };
var querystring__strictUriEncode = $m['strict-uri-encode'].exports;
var querystring__objectAssign = $m['object-assign'].exports;

function querystring__encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [querystring__encode(key, opts), '[', index, ']'].join('') : [querystring__encode(key, opts), '[', querystring__encode(index, opts), ']=', querystring__encode(value, opts)].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? querystring__encode(key, opts) : [querystring__encode(key, opts), '[]=', querystring__encode(value, opts)].join('');
			};

		default:
			return function (key, value) {
				return value === null ? querystring__encode(key, opts) : [querystring__encode(key, opts), '=', querystring__encode(value, opts)].join('');
			};
	}
}

function querystring__parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)]$/.exec(key);

				key = key.replace(/\[\d*]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[])$/.exec(key);

				key = key.replace(/\[]$/, '');

				if (!result || accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function querystring__encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? querystring__strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function querystring__keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return querystring__keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

$m['query-string'].exports.extract = function (str) {
	return str.split('?')[1] || '';
};

$m['query-string'].exports.parse = function (str, opts) {
	opts = querystring__objectAssign({ arrayFormat: 'none' }, opts);

	var formatter = querystring__parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		formatter(decodeURIComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = querystring__keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
};

$m['query-string'].exports.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = querystring__objectAssign(defaults, opts);

	var formatter = querystring__encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return querystring__encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return querystring__encode(key, opts) + '=' + querystring__encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};
/*≠≠ node_modules/query-string/index.js ≠≠*/


/*== src/lib/request.js ==*/
$m['src/lib/request'] = { exports: {} };

var srclibrequest__cookieLib = $m['cookie'].exports;
var srclibrequest__Emitter = $m['eventemitter3'].exports;
var srclibrequest__qsParse = $m['query-string'].exports.parse;
var srclibrequest__urlUtils = $m['@yr/url-utils'].exports;

var srclibrequest__RE_SPLIT = /[?#]/;

var srclibrequest__Request = function (_srclibrequest__Emitt) {
  babelHelpers.inherits(srclibrequest__Request, _srclibrequest__Emitt);

  /**
   * Constructor
   * @param {String} url
   * @param {Boolean} bootstrap
   */
  function srclibrequest__Request(url, bootstrap) {
    babelHelpers.classCallCheck(this, srclibrequest__Request);

    var _this = babelHelpers.possibleConstructorReturn(this, _srclibrequest__Emitt.call(this));

    url = url ? srclibrequest__urlUtils.encode(url) : srclibrequest__urlUtils.getCurrent();

    var path = url.split(srclibrequest__RE_SPLIT);
    var qs = ~url.indexOf('?') && path[1] || '';
    var hash = ~url.indexOf('#') && path[path.length - 1] || '';

    _this.app = null;
    _this.baseUrl = '';
    _this.bootstrap = bootstrap || false;
    _this.cached = false;
    _this.cookies = srclibrequest__cookieLib.parse(document.cookie);
    _this.hash = srclibrequest__qsParse(hash);
    _this.params = null;
    _this.path = srclibrequest__urlUtils.sanitize(path[0]);
    _this.query = srclibrequest__qsParse(qs);
    _this.querystring = qs;
    _this.refreshed = false;
    _this.search = qs ? '?' + qs : '';
    // Ignore hash
    _this.url = _this.originalUrl = url.split('#')[0];
    return _this;
  }

  /**
   * Abort response
   */


  srclibrequest__Request.prototype.abort = function abort() {
    this.reset();
    this.emit('close');
  };

  /**
   * Reset state
   * @param {Boolean} bootstrap
   */


  srclibrequest__Request.prototype.reset = function reset(bootstrap) {
    this.baseUrl = '';
    this.bootstrap = bootstrap || false;
    this.cached = false;
    this.path = srclibrequest__urlUtils.sanitize(this.originalUrl.split('?')[0]);
    this.params = null;
    this.refreshed = false;
  };

  return srclibrequest__Request;
}(srclibrequest__Emitter);

/**
 * Instance factory
 * @param {String} url
 * @param {Boolean} bootstrap
 * @returns {Request}
 */


$m['src/lib/request'].exports = function (url, bootstrap) {
  return new srclibrequest__Request(url, bootstrap);
};
$m['src/lib/request'].exports.Request = srclibrequest__Request;
/*≠≠ src/lib/request.js ≠≠*/


/*== src/lib/history.js ==*/
$m['src/lib/history'] = { exports: {} };

var srclibhistory__Debug = $m['debug'].exports;
var srclibhistory__urlUtils = $m['@yr/url-utils'].exports;

var srclibhistory__debug = srclibhistory__Debug('express:history');
var srclibhistory__bootstrap = true;

var srclibhistory__History = function () {
  /**
   * Constructor
   * @param {Function} request(url)
   * @param {Function} response
   * @param {Function} fn(req, res)
   */
  function srclibhistory__History(request, response, fn) {
    babelHelpers.classCallCheck(this, srclibhistory__History);

    this.cache = {};
    this.current = '';
    this.running = false;
    this.request = request;
    this.response = response;
    this.fn = fn;
    this.onClick = this.onClick.bind(this);
    this.onPopstate = this.onPopstate.bind(this);
    this.navigateTo = this.navigateTo.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
    this.getCurrentContext = this.getCurrentContext.bind(this);
  }

  /**
   * Notify on current context,
   * and begin listening for history changes
   * @returns {History}
   */


  srclibhistory__History.prototype.listen = function listen() {
    var _this = this;

    // Handle current history state (triggers notification)
    var ctx = this.handle();

    if (!this.running && ctx) {
      // Test History API availability
      if (srclibhistory__hasHistory()) {
        // Delay to prevent premature trigger when navigating back from nothing
        setTimeout(function () {
          window.addEventListener('click', _this.onClick, false);
          window.addEventListener('popstate', _this.onPopstate, false);
          _this.running = true;
        }, 500);

        // Update so that popstate will trigger for this route
        window.history.replaceState({}, document.title);

        srclibhistory__debug('listening with history API');
      }
    }

    return this;
  };

  /**
   * Create a new or updated history state at 'url' with 'title'
   * @param {String} url
   * @param {String} title
   * @param {Boolean} isUpdate
   * @param {Boolean} noScroll
   */


  srclibhistory__History.prototype.navigateTo = function navigateTo(url, title, isUpdate, noScroll) {
    // Only navigate if not same as current
    if (url != srclibhistory__urlUtils.getCurrent()) {
      if (this.running) {
        // Will return empty if malformed
        url = srclibhistory__urlUtils.encode(url);
        if (!url) return;

        srclibhistory__debug('navigate to: %s', url);

        window.history[isUpdate ? 'replaceState' : 'pushState']({}, title, url);
        if (title) document.title = title;
        this.handle(url, noScroll);
      } else {
        this.redirectTo(url);
      }
    }
  };

  /**
   * Stop history management by redirecting to 'url'
   * @param {String} url
   */


  srclibhistory__History.prototype.redirectTo = function redirectTo(url) {
    this.destroy();
    window.location = srclibhistory__urlUtils.encode(url);
  };

  /**
   * Force a re-handle of current context
   */


  srclibhistory__History.prototype.refresh = function refresh() {
    var ctx = this.getCurrentContext();

    // Undo pipeline modifications
    ctx.req.reset();
    ctx.res.reset();
    ctx.req.refreshed = true;
    this.fn(ctx.req, ctx.res);
  };

  /**
   * Retrieve current context
   * @returns {Object}
   */


  srclibhistory__History.prototype.getCurrentContext = function getCurrentContext() {
    return this.cache[this.current];
  };

  /**
   * Stop listening for history updates
   */


  srclibhistory__History.prototype.destroy = function destroy() {
    if (this.running) {
      window.removeEventListener('click', this.onClick, false);
      window.removeEventListener('popstate', this.onPopstate, false);
      this.cache = null;
      this.running = false;
    }
  };

  /**
   * Handle history change and notify
   * @param {String} [url]
   * @param {Boolean} [noScroll]
   * @returns {Object}
   */


  srclibhistory__History.prototype.handle = function handle(url, noScroll) {
    var ctx = {};
    var req = void 0,
        res = void 0;

    url = url ? srclibhistory__urlUtils.encode(url) : srclibhistory__urlUtils.getCurrent();
    // Error encoding url
    if (!url) return this.redirectTo(url);

    // Do nothing if current url is the same
    if (this.current && this.current === url) return;

    if (this.cache[url]) {
      ctx = this.cache[url];
      req = ctx.req;
      res = ctx.res;
      // Always reset in order to undo pipeline modifications
      req.reset();
      res.reset();
      // Set flag for use downstream
      req.cached = res.cached = true;
      req.refreshed = false;
      srclibhistory__debug('context retrieved from cache: %s', url);
    } else {
      req = this.request(url, srclibhistory__bootstrap);
      res = this.response(req);
      srclibhistory__debug('generating new context: %s', url);
    }
    res.req = req;
    ctx.req = req;
    ctx.res = res;
    this.cache[url] = ctx;

    // Abort if current request/response is not finished
    if (this.current && !this.cache[this.current].res.finished) {
      this.cache[this.current].res.abort();
    }

    // Set scroll position to top if not bootstrap or overridden
    if (!srclibhistory__bootstrap && !noScroll) window.scrollTo(0, 0);

    this.fn(req, res);

    // Store reference to current
    // Do after calling fn so previous ctx available with getCurrentContext
    this.current = url;

    // Make sure only first request flagged as bootstrap
    srclibhistory__bootstrap = false;

    return ctx;
  };

  /**
   * Handle history change via 'popstate' event
   * @param {Object} evt
   */


  srclibhistory__History.prototype.onPopstate = function onPopstate(evt) {
    // Prevent initial page load from triggering on some platforms when no state
    if (evt.state && this.running) {
      this.handle();
    }
  };

  /**
   * Handle click event
   * from https://github.com/visionmedia/page.js/
   * @param {Object} evt
   * @returns {null}
   */


  srclibhistory__History.prototype.onClick = function onClick(evt) {
    var which = null == evt.which ? evt.button : evt.which;
    var el = evt.target;

    // Modifiers present
    if (which != 1) return;
    if (evt.metaKey || evt.ctrlKey || evt.shiftKey) return;
    if (evt.defaultPrevented) return;

    // Find anchor
    // svg elements on some platforms don't have nodeNames
    while (el && (el.nodeName == null || 'A' != el.nodeName.toUpperCase())) {
      el = el.parentNode;
    }

    // Anchor not found
    if (!el || 'A' != el.nodeName.toUpperCase()) return;

    // Cross origin
    if (!srclibhistory__sameOrigin(el.href)) return this.fn(el.href);

    // IE11 prefixes extra slash on absolute links
    var path = (el.pathname + el.search).replace(/\/\//, '/');
    var isSameAsCurrent = path == srclibhistory__urlUtils.getCurrent();

    // Anchor target on same page
    if (isSameAsCurrent && 'string' == typeof el.hash && el.hash) return;

    evt.preventDefault();

    // Same as current
    if (isSameAsCurrent) return;

    // Blur focus
    el.blur();

    srclibhistory__debug('click event intercepted from %s', el);
    this.navigateTo(path);
  };

  return srclibhistory__History;
}();

/**
 * Test for history API (Modernizr)
 * @returns {Boolean}
 */


function srclibhistory__hasHistory() {
  var ua = navigator.userAgent;

  // Stock android browser 2.2 & 2.3 & 4.0.x are buggy, ignore
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
  // Chrome identifies itself as 'Mobile Safari'
  ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) {
    return false;
  }

  // Usual test
  return window.history && 'pushState' in window.history;
}

/**
 * Check if 'url' is from same origin
 * @param {String} url
 * @returns {Boolean}
 */
function srclibhistory__sameOrigin(url) {
  var origin = location.protocol + '//' + location.hostname;

  if (location.port) origin += ':' + location.port;
  return url && url.indexOf(origin) == 0;
}

/**
 * Instance factory
 * @param {Function} request
 * @param {Function} response
 * @param {Function} fn(req, res)
 * @returns {History}
 */
$m['src/lib/history'].exports = function (request, response, fn) {
  return new srclibhistory__History(request, response, fn);
};
/*≠≠ src/lib/history.js ≠≠*/


/*== src/lib/application.js ==*/
$m['src/lib/application'] = { exports: {} };

var srclibapplication__Debug = $m['debug'].exports;
var srclibapplication__Emitter = $m['eventemitter3'].exports;
var srclibapplication__history = $m['src/lib/history'].exports;
var srclibapplication__request = $m['src/lib/request'].exports;
var srclibapplication__response = $m['src/lib/response'].exports;
var srclibapplication__router = $m['src/lib/router'].exports;

var srclibapplication__debug = srclibapplication__Debug('express:application');

var srclibapplication__Application = function (_srclibapplication__E) {
  babelHelpers.inherits(srclibapplication__Application, _srclibapplication__E);

  /**
   * Constructor
   */
  function srclibapplication__Application() {
    babelHelpers.classCallCheck(this, srclibapplication__Application);

    var _this = babelHelpers.possibleConstructorReturn(this, _srclibapplication__E.call(this));

    _this.settings = {
      env: 'development' || 'development'
    };
    _this.cache = {};
    _this.locals = {};
    _this.mountpath = '/';
    _this._router = srclibapplication__router({
      caseSensitive: false,
      strict: false,
      mergeParams: true
    });
    _this.parent = null;

    _this.handle = _this.handle.bind(_this);
    _this.navigateTo = _this.navigateTo.bind(_this);
    _this.redirectTo = _this.redirectTo.bind(_this);
    _this.getCurrentContext = _this.getCurrentContext.bind(_this);
    _this.refresh = _this.refresh.bind(_this);

    // Create request/response factories
    var app = _this;
    var requestFactory = function requestFactory(url, bootstrap) {
      var req = srclibapplication__request(url, bootstrap);

      req.app = app;
      return req;
    };
    var responseFactory = function responseFactory() {
      var res = srclibapplication__response();

      res.app = app;
      return res;
    };

    _this.history = srclibapplication__history(requestFactory, responseFactory, _this.handle);

    // Route ALL/POST methods to router
    _this.all = _this._router.all.bind(_this._router);
    _this.post = _this._router.post.bind(_this._router);
    return _this;
  }

  /**
   * Store 'value' for 'key'
   * @param {String} key
   * @param {Object} value
   * @returns {Object}
   */


  srclibapplication__Application.prototype.set = function set(key, value) {
    // get()
    if (arguments.length == 1) return this.settings[key];

    this.settings[key] = value;
  };

  /**
   * Add one or more 'fn' to middleware pipeline at optional 'path'
   */


  srclibapplication__Application.prototype.use = function use() {
    var _this2 = this;

    var offset = 0;
    var path = '/';

    for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    if ('string' == typeof fns[0]) {
      offset = 1;
      path = fns[0];
    }

    fns.slice(offset).forEach(function (fn) {
      if (fn instanceof srclibapplication__Application) {
        (function () {
          var app = fn;
          var handler = app.handle;

          app.mountpath = path;
          app.parent = _this2;
          fn = function mounted_app(req, res, next) {
            // Change app reference to mounted
            var orig = req.app;

            req.app = res.app = app;
            handler(req, res, function (err) {
              // Restore app reference when done
              req.app = res.app = orig;
              next(err);
            });
          };
        })();
      }

      srclibapplication__debug('adding application middleware layer with path %s', path);
      _this2._router.use(path, fn);
    });
  };

  /**
   * Add GET at 'path' with strict matching of path
   * @param {String} path
   * @returns {Object}
   */


  srclibapplication__Application.prototype.get = function get(path) {
    var _router;

    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    // Not verb, only get/set
    if (!args.length) return this.set(path);

    (_router = this._router).get.apply(_router, [path].concat(args));

    return this;
  };

  /**
   * Handle param 'name' with 'fn'
   * @param {String} name
   * @param {Function} fn(req, res, next, value)
   */


  srclibapplication__Application.prototype.param = function param(name, fn) {
    this._router.param(name, fn);
  };

  /**
   * Start listening for requests
   */


  srclibapplication__Application.prototype.listen = function listen() {
    if (!this.parent) this.history.listen();
  };

  /**
   * Run request/response through router's middleware pipline
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done
   */


  srclibapplication__Application.prototype.handle = function handle(req, res, done) {
    // Handle external link
    if ('string' == typeof req) {
      this.emit('link:external', req);
    } else {
      this.emit('connect', req);
      this._router.handle(req, res, done || function () {});
    }
  };

  /**
   * Change/update browser history state
   * @param {String} url
   * @param {String} title
   * @param {Boolean} isUpdate
   * @param {Boolean} noScroll
   */


  srclibapplication__Application.prototype.navigateTo = function navigateTo(url, title, isUpdate, noScroll) {
    this[this.parent ? 'parent' : 'history'].navigateTo(url, title, isUpdate, noScroll);
  };

  /**
   * Force browser location change
   * @param {String} url
   * @param {String} title
   */


  srclibapplication__Application.prototype.redirectTo = function redirectTo(url) {
    this[this.parent ? 'parent' : 'history'].redirectTo(url);
  };

  /**
   * Retrieve current context
   * @returns {Object}
   */


  srclibapplication__Application.prototype.getCurrentContext = function getCurrentContext() {
    return this[this.parent ? 'parent' : 'history'].getCurrentContext();
  };

  /**
   * Refresh current location
   */


  srclibapplication__Application.prototype.refresh = function refresh() {
    this[this.parent ? 'parent' : 'history'].refresh();
  };

  return srclibapplication__Application;
}(srclibapplication__Emitter);

/**
 * Instance factory
 * @returns {Application}
 */


$m['src/lib/application'].exports = function () {
  return new srclibapplication__Application();
};
/*≠≠ src/lib/application.js ≠≠*/


/*== src/index.js ==*/
$m['src/index'] = { exports: {} };

/**
 * An express.js framework for the browser
 * https://github.com/yr/express-client
 * @copyright Yr
 * @license MIT
 */

var srcindex___require = $m['src/lib/request'].exports,
    srcindex__Request = srcindex___require.Request;

var srcindex___require2 = $m['src/lib/response'].exports,
    srcindex__Response = srcindex___require2.Response;

var srcindex__application = $m['src/lib/application'].exports;
var srcindex__Router = $m['src/lib/router'].exports;

/**
 * Application factory
 * @returns {Application}
 */
$m['src/index'].exports = function createApplication() {
  return srcindex__application();
};

// Expose constructor
$m['src/index'].exports.Router = srcindex__Router;
// Expose prototypes
$m['src/index'].exports.request = srcindex__Request.prototype;
$m['src/index'].exports.response = srcindex__Response.prototype;
/*≠≠ src/index.js ≠≠*/
})()