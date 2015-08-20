'use strict';

/**
 * Browser response object
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var assign = require('object-assign'),
    _cookie = require('cookie'),
    Emitter = require('eventemitter3');

/**
 * Instance factory
 */
module.exports = function () {
	return new Response();
};

var Response = (function (_Emitter) {
	_inherits(Response, _Emitter);

	/**
  * Constructor
  */

	function Response() {
		_classCallCheck(this, Response);

		_Emitter.call(this);

		this.app;
		this.req;
		this.reset();
	}

	/**
  * Reset state
  */

	Response.prototype.reset = function reset() {
		this.cached = false;
		this.finished = false;
		this.locals = {};
		this.statusCode = 404;
	};

	/**
  * Set status 'code'
  * @param {Number} code
  * @returns {Response}
  */

	Response.prototype.status = function status(code) {
		this.statusCode = code;
		return this;
	};

	/**
  * Send response (last method called in pipeline)
  */

	Response.prototype.send = function send() {
		// Reset state
		this.req.reset();
		this.status(200);
		this.finished = true;
		this.emit('finish');
	};

	/**
  * Redirect to 'url'
  * @param {Number} statusCode
  * @param {String} url
  */

	Response.prototype.redirect = function redirect(statusCode, url) {
		this.app.redirectTo(url || statusCode);
	};

	/**
  * Set cookie
  * @param {String} name
  * @param {String|Object} val
  * @param {Object} options
  * @returns {Response}
  */

	Response.prototype.cookie = function cookie(name, val, options) {
		options = assign({}, options);

		if ('number' == typeof val) val = val.toString();
		if ('object' == typeof val) val = 'j:' + JSON.stringify(val);

		if ('maxAge' in options) {
			options.expires = new Date(Date.now() + options.maxAge);
			options.maxAge /= 1000;
		}

		if (null == options.path) options.path = '/';
		var headerVal = _cookie.serialize(name, String(val), options);

		document.cookie = headerVal;

		return this;
	};

	return Response;
})(Emitter);