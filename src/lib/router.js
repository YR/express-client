'use strict';

/**
 * Router for handling middleware pipeline.
 * Can be isolated under a specific mount path.
 */

const assign = require('object-assign')
	, debug = require('debug')('express:router')
	, layer = require('./layer')
	, urlUtils = require('@yr/url-utils')

	, DEFAULTS = {
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

class Router {
	/**
	 * Constructor
	 * @param {Object} [options]
	 */
	constructor (options) {
		options = assign({}, DEFAULTS, options);

		let boundMethod = this.method.bind(this);

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
		this.params;
	}

	/**
	 * Handle param 'name' with 'fn'
	 * @param {String} name
	 * @param {Function} fn(req, res, next, value)
	 */
	param (name, fn) {
		if (!this.params) this.params = {};
		this.params[name] = fn;
	}

	/**
	 * Add one or more 'fn' to middleware pipeline at optional 'path'
	 * @param {Function} fn
	 */
	use (/* path, */ fn /* ...fn */) {
		let offset = 0
			, path = '/'
			, fns;

		if ('string' == typeof fn) {
			offset = 1;
			path = fn;
		}

		fns = Array.prototype.slice.call(arguments, offset);

		fns.forEach(function (fn) {
			if (fn instanceof Router) {
				fn = fn.handle;
			}
			const lyr = layer(path, fn, this.matcherOpts);

			debug('adding router middleware %s with path %s', lyr.name, path);
			this.stack.push(lyr);
		}, this);
	}

	/**
	 * Register method at 'path'
	 * @param {String} path
	 */
	method (path) {
		const fns = Array.prototype.slice.call(arguments, 1);

		fns.forEach(function (fn) {
			let lyr = layer(path, fn, this.strictMatcherOpts);

			lyr.route = true;

			debug('adding router route %s with path %s', lyr.name, path);
			this.stack.push(lyr);
		}, this);
	}

	/**
	 * Run request/response through middleware pipline
	 * @param {Request} req
	 * @param {Response} res
	 * @param {Function} done
	 */
	handle (req, res, done) {
		const self = this
			, parentUrl = req.baseUrl || '';

		let idx = 0
			, processedParams = {}
			, removed = '';

		// Update done to restore req props
		done = restore(done, req, 'baseUrl', 'next', 'params');

		// Setup next layer
		req.next = next;
		req.baseUrl = parentUrl;

		next();

		function next (err) {
			var lyr = self.stack[idx++]
				, layerErr = err;

			if (removed.length != 0) {
				debug('untrim %s from url %s', removed, req.path);
				req.baseUrl = parentUrl;
				req.path = urlUtils.join(removed, req.path);
				removed = '';
			}

			// Exit
			if (!lyr) return done(err);

			// Skip if no match
			if (!lyr.match(req.path)) return next(err);

			debug('%s matched layer %s with path %s', req.path, lyr.name, lyr.path);

			// Store params
			if (self.mergeParams) {
				if (!req.params) req.params = {};
				assign(req.params, lyr.params);
			} else {
				req.params = lyr.params;
			}

			const keys = Object.keys(lyr.params);

			// Process params if necessary
			self._processParams(processedParams, req.params, keys, req, res, function (err) {
				if (err) return next(layerErr || err);
				if (!lyr.route) trim(lyr);
				return lyr.handle(layerErr, req, res, next);
			});
		}

		function trim (layer) {
			if (layer.path.length != 0) {
				debug('trim %s from url %s', layer.path, req.path);
				removed = layer.path;
				req.path = req.path.substr(removed.length);
				if (req.path.charAt(0) != '/') req.path = '/' + req.path;

				req.baseUrl = urlUtils.join(parentUrl, removed);
			}
		}
	}

	/**
	 * Process middleware matched parameters
	 * @param {Object} processedParams
	 * @param {Object} params
	 * @param {Array} keys
	 * @param {Request} req
	 * @param {Response} res
	 * @param {Function} done(err)
	 */
	_processParams (processedParams, params, keys, req, res, done) {
		const self = this;

		let idx = 0;

		function next (err) {
			// Stop processing on any error
			if (err) return done(err);

			if (idx >= keys.length) return done();

			const name = keys[idx++]
				, fn = self.params[name];

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
	}
}

/**
 * Restore 'obj' props
 * @param {Function} fn
 * @param {Object} obj
 */
function restore (fn, obj) {
	let props = new Array(arguments.length - 2)
		, vals = new Array(arguments.length - 2);

	for (let i = 0; i < props.length; i++) {
		props[i] = arguments[i + 2];
		vals[i] = obj[props[i]];
	}

	return function () {
		// Restore vals
		for (let i = 0; i < props.length; i++) {
			obj[props[i]] = vals[i];
		}

		return fn.apply(this, arguments);
	};
}