/**
 * Router layer object
 */

var matcher = require('path-to-regexp')
	, urlUtils = require('url-utils');

module.exports = Layer;

/**
 * Constructor
 * @param {String} url
 */
function Layer (path, fn, options) {
	if (!(this instanceof Layer)) {
		return new Layer(path, fn, options);
	}

	// To be filled by matcher
	this.keys = [];
	this.path = null;
	this.params = null;
	this.fn = fn;
	this.name = fn.name ? '<' + fn.name + '>' : '<anonymous>';
	this.fastmatch = (path == '/' && !options.end);
	this.regexp = matcher(this._path(path), this.keys, options);

}

/**
 * Determine if this route matches 'path'
 * @param {String} path
 * @returns {Boolean}
 */
Layer.prototype.match = function (path) {
	if (this.fastmatch) {
		this.params = {};
		this.path = '';
		return true;
	}

	var match = this.regexp.exec(path);

	if (!match) {
		this.params = null;
		this.path = null;
		return false;
	}

	this.params = {};
	this.path = match[0];

	var n = 0
		, key, val;

	for (var i = 1, len = match.length; i < len; ++i) {
		key = this.keys[i - 1];
		val = urlUtils.decode(match[i]);

		if (key) {
			this.params[key.name] = val;
		} else {
			this.params[n++] = val;
		}
	}

	return true;
};

/**
 * Handle
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
Layer.prototype.handle = function (err, req, res, next) {
	if (err) {
		// Only call if it handles errors
		return (this.fn.length > 3)
			? this.fn(err, req, res, next)
			: next(err);
	}

	// Skip if error handler
	return (this.fn.length < 4)
		? this.fn(req, res, next)
		: next();
};

/**
 * Format 'path'
 * @params {String} path
 * @returns {String}
 */
Layer.prototype._path = function (path) {
	// Convert wildcard
	return (path == '*')
		? '(.*)'
		: path;
};