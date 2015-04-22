/**
 * Browser response object
 */

var cookie = require('cookie')
	, emitter = require('eventemitter3')
	, merge = require('./safeMerge');

module.exports = Response;

/**
 * Constructor
 */
function Response () {
	if (!(this instanceof Response)) {
		return new Response();
	}

	this.locals = {};
	this.statusCode = 404;
	this.finished = false;
	this.cached = false;
	this.app;
	this.req;

	merge(this, emitter.prototype);
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
	this.status(200);
	// Reset for first request
	// Prevents return to unhandled pages not triggering redirect
	this.req.bootstrap = false;
	// Resetting request state
	this.req.params = null;
	this.req.path = this.req.originalUrl;
	this.req.baseUrl = '';
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
 * Render 'view' with the given 'options' and optional callback 'fn'
 * @param {String} view
 * @param {Object} [options]
 * @param {Function} [fn(err)]
 */
Response.prototype.render = function (view, options, fn) {
	options = options || {};

	var self = this
		, app = this.app
		, req = this.req;

	if ('function' == typeof options) {
		fn = options;
		options = {};
	}

	// Store locals so that app can merge
	options._locals = this.locals;

	// Default callback
	fn = fn || function (err) {
		if (err) return req.next(err);
		self.send();
	};

	app.render(view, options, fn);
};

/**
 * Set cookie
 * @param {String} name
 * @param {String|Object} val
 * @param {Object} options
 * @returns {Response}
 */
Response.prototype.cookie = function (name, val, options) {
  options = merge({}, options);

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