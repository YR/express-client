'use strict';

/**
 * Router for handling middleware pipeline.
 * Can be isolated under a specific mount path.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var assign = require('object-assign'),
    debug = require('debug')('express:router'),
    layer = require('./layer'),
    urlUtils = require('@yr/url-utils'),
    DEFAULTS = {
	mergeParams: true,
	caseSensitive: false,
	strict: false
};

/**
 * Instance factory
 * @param {Object} [options]
 */
module.exports = function (options) {
	return new Router(options);
};

var Router = (function () {
	/**
  * Constructor
  * @param {Object} [options]
  */

	function Router(options) {
		_classCallCheck(this, Router);

		options = assign({}, DEFAULTS, options);

		this.stack = [];
		this.mergeParams = options.mergeParams;
		this.handle = this.handle.bind(this);
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
		this.params;
	}

	/**
  * Restore 'obj' props
  * @param {Function} fn
  * @param {Object} obj
  */

	/**
  * Handle param 'name' with 'fn'
  * @param {String} name
  * @param {Function} fn(req, res, next, value)
  */

	Router.prototype.param = function param(name, fn) {
		if (!this.params) this.params = {};
		this.params[name] = fn;
	};

	/**
  * Add one or more 'fn' to middleware pipeline at optional 'path'
  * @param {Function} fn
  */

	Router.prototype.use = function use( /* path, */fn /* ...fn */) {
		var offset = 0,
		    path = '/',
		    fns = undefined;

		if ('string' == typeof fn) {
			offset = 1;
			path = fn;
		}

		fns = Array.prototype.slice.call(arguments, offset);

		fns.forEach(function (fn) {
			if (fn instanceof Router) {
				fn = fn.handle;
			}
			var lyr = layer(path, fn, this.matcherOpts);

			debug('adding router middleware %s with path %s', lyr.name, path);
			this.stack.push(lyr);
		}, this);
	};

	/**
  * Add get at 'path' with strict matching of path
  * @param {String} path
 	 * @returns {Object}
  */

	Router.prototype.get = function get(path) {
		var fns = Array.prototype.slice.call(arguments, 1);

		fns.forEach(function (fn) {
			var lyr = layer(path, fn, this.strictMatcherOpts);
			lyr.route = true;
			debug('adding router route %s with path %s', lyr.name, path);
			this.stack.push(lyr);
		}, this);
	};

	/**
  * Run request/response through middleware pipline
  * @param {Request} req
  * @param {Response} res
  * @param {Function} done
  */

	Router.prototype.handle = function handle(req, res, done) {
		var self = this,
		    parentUrl = req.baseUrl || '';

		var idx = 0,
		    processedParams = {},
		    removed = '';

		// Update done to restore req props
		done = restore(done, req, 'baseUrl', 'next', 'params');

		// Setup next layer
		req.next = next;
		req.baseUrl = parentUrl;

		next();

		function next(_x) {
			var _again = true;

			_function: while (_again) {
				var err = _x;
				lyr = layerErr = keys = undefined;
				_again = false;

				var lyr = self.stack[idx++],
				    layerErr = err;

				if (removed.length != 0) {
					debug('untrim %s from url %s', removed, req.path);
					req.baseUrl = parentUrl;
					req.path = urlUtils.join(removed, req.path);
					removed = '';
				}

				// Exit
				if (!lyr) return done(err);

				// Skip if no match
				if (!lyr.match(req.path)) {
					_x = err;
					_again = true;
					continue _function;
				}

				debug('%s matched layer %s with path %s', req.path, lyr.name, lyr.path);

				// Store params
				if (self.mergeParams) {
					if (!req.params) req.params = {};
					assign(req.params, lyr.params);
				} else {
					req.params = lyr.params;
				}

				var keys = Object.keys(lyr.params);

				// Process params if necessary
				self._processParams(processedParams, req.params, keys, req, res, function (err) {
					if (err) return next(layerErr || err);
					if (!lyr.route) trim(lyr);
					return lyr.handle(layerErr, req, res, next);
				});
			}
		}

		function trim(layer) {
			if (layer.path.length != 0) {
				debug('trim %s from url %s', layer.path, req.path);
				removed = layer.path;
				req.path = req.path.substr(removed.length);
				if (req.path.charAt(0) != '/') req.path = '/' + req.path;

				req.baseUrl = urlUtils.join(parentUrl, removed);
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

	Router.prototype._processParams = function _processParams(processedParams, params, keys, req, res, done) {
		var self = this;

		var idx = 0;

		function next(err) {
			// Stop processing on any error
			if (err) return done(err);

			if (idx >= keys.length) return done();

			var name = keys[idx++],
			    fn = self.params[name];

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

	return Router;
})();

function restore(fn, obj) {
	var props = new Array(arguments.length - 2),
	    vals = new Array(arguments.length - 2);

	for (var i = 0; i < props.length; i++) {
		props[i] = arguments[i + 2];
		vals[i] = obj[props[i]];
	}

	return function () {
		// Restore vals
		for (var i = 0; i < props.length; i++) {
			obj[props[i]] = vals[i];
		}

		return fn.apply(this, arguments);
	};
}