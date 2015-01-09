/**
 * Browser response object
 */

var emitter = require('eventemitter3')
	, PRIVATE_PROPS = {
			statusCode: true,
			finished: true,
			cached: true,
			req: true,
			_callbacks: true
		};

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

	emitter(this);
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
	this._finish(200);
	this.emit('finish');
};

/**
 * Abort response
 */
Response.prototype.abort = function () {
	this._finish(499);
	this.emit('close');
};

/**
 * Redirect to 'url'
 * @param {String} url
 */
Response.prototype.redirect = function (url) {
	this.app.redirectTo(url);
};

/**
 * Partially render 'view' with 'options'
 * @param {String} view
 * @param {Object} [options]
 */
Response.prototype.flush = function (view, options) {
	var req = this.req
		, fn = function (err) {
				if (err) return req.next(err);
				// Do not trigger send
			};

	this.render(view, options, fn);
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
 * Generate a cloned copy
 */
Response.prototype.clone = function () {
	var instance = Response();

	// Copy all non-private props
	for (var prop in this) {
		if (this.hasOwnProperty(prop) && !PRIVATE_PROPS[prop]) instance[prop] = this[prop];
	}

	return instance;
};

/**
 * Set finish state
 * @param {Number} code
 */
Response.prototype._finish = function (code) {
	this.status(code);
	// Reset for first request
	// Prevents return to unhandled pages not triggering redirect
	this.req.bootstrap = false;
	this.finished = true;
};