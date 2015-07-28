'use strict';

/**
 * Browser response object
 */

var assign = require('object-assign')
	, cookie = require('cookie')
	, emitter = require('eventemitter3');

module.exports = Response;

/**
 * Constructor
 */
function Response () {
	if (!(this instanceof Response)) {
		return new Response();
	}

	this.app;
	this.req;
	this.reset();

	assign(this, emitter.prototype);
}

/**
 * Reset state
 */
Response.prototype.reset = function () {
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
Response.prototype.status = function (code) {
	this.statusCode = code;
	return this;
};

/**
 * Send response (last method called in pipeline)
 */
Response.prototype.send = function () {
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
Response.prototype.redirect = function (statusCode, url) {
	this.app.redirectTo(url || statusCode);
};

/**
 * Set cookie
 * @param {String} name
 * @param {String|Object} val
 * @param {Object} options
 * @returns {Response}
 */
Response.prototype.cookie = function (name, val, options) {
  options = assign({}, options);

  if ('number' == typeof val) val = val.toString();
  if ('object' == typeof val) val = 'j:' + JSON.stringify(val);

  if ('maxAge' in options) {
    options.expires = new Date(Date.now() + options.maxAge);
    options.maxAge /= 1000;
  }

  if (null == options.path) options.path = '/';
  var headerVal = cookie.serialize(name, String(val), options);

  document.cookie = headerVal;

  return this;
};