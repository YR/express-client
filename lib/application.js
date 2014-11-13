/**
 * Browser application
 */

var bind = require('lodash-node/compat/functions/bind')
	, debug = require('debug')('express:application')
	, forEach = require('lodash-node/compat/collections/forEach')
	, history = require('./history')
	, merge = require('lodash-node/compat/objects/merge')
	, request = require('./request')
	, response = require('./response')
	, router = require('./router')

	, METHODS = ['get', 'post', 'all'];

module.exports = Application;

/**
 * Constructor
 */
function Application () {
	if (!(this instanceof Application)) {
		return new Application();
	}

	this.settings = {
		env: process.env.NODE_ENV || 'development'
	};
	this.cache = {};
	this.locals = {};
	this.mountpath = '/';
	this._router = router({
		caseSensitive: false,
		strict: false,
		mergeParams: true
	});
	this.parent;

	this.handle = bind(this.handle, this);
	this.finalhandler = bind(this.finalhandler, this);
	this.navigateTo = bind(this.navigateTo, this);
	this.redirectTo = bind(this.redirectTo, this);

	// Create request/response factories
	var app = this
		, req = function (url, bootstrap) {
				var req = request(url, bootstrap);
				req.app = app;
				return req;
			}
		, res = function () {
				var res = response();
				res.app = app;
				return res;
			};

	this.history = history(req, res, this.handle);
}

/**
 * Store 'value' for 'key'
 * @param {String} key
 * @param {Object} value
 */
Application.prototype.set = function (key, value) {
	// get()
	if (arguments.length == 1) return this.settings[key];

	this.settings[key] = value;
};

/**
 * Add one or more 'fn' to middleware pipeline at optional 'path'
 * @param {Function} fn
 */
Application.prototype.use = function (/* path, */ fn /* ...fn */) {
	var offset = 0
		, path = '/'
		, fns, path;

	if ('string' == typeof fn) {
		offset = 1;
		path = fn;
	}

	fns = Array.prototype.slice.call(arguments, offset);

	forEach(fns, function (fn) {
		if (fn instanceof Application) {
			var app = fn
				, handler = app.handle;
			app.mountpath = path;
			app.parent = this;
			fn = function mounted_app (req, res, next) {
				// Change app reference to mounted
				var orig = req.app;
				req.app = res.app = app;
				handler(req, res, function (err) {
					// Restore app reference when done
					req.app = res.app = orig;
					next(err);
				});
			};
		}

		debug('adding application middleware layer with path %s', path);
		this._router.use(path, fn);
	}, this);
};

/**
 * Handle param 'name' with 'fn'
 * @param {String} name
 * @param {Function} fn(req, res, next, value)
 */
Application.prototype.param = function (name, fn) {
	this._router.param(name, fn);
};

/**
 * Add one or more VERB fns at 'path' with strict matching of path
 * @param {String} path
 */
forEach(METHODS, function (method) {
	Application.prototype[method] = function (path) {
		// get/set version
		if (method == 'get' && arguments.length == 1) return this.set(path);

		this._router[method].apply(this._router, Array.prototype.slice.call(arguments));

		return this;
	};
});

/**
 * Start listening for requests
 */
Application.prototype.listen = function () {
	if (!this.parent) this.history.listen();
};

/**
 * Run request/response through router's middleware pipline
 * @param {Request} req
 * @param {Response} res
 * @param {Function} done
 */
Application.prototype.handle = function (req, res, done) {
	this._router.handle(req, res, done || this.finalhandler);
};

/**
 *
 */
Application.prototype.finalhandler = function (err) {
};

/**
 * Render view with given 'name', 'options' and callback 'fn'
 * @param {String} name
 * @param {Object} [options]
 * @param {Function} fn(err, html)
 */
Application.prototype.render = function (name, options, fn) {
	var opts = {}
		, view;

	if ('function' == typeof options) {
		fn = options;
		options = {};
	}

	// Merge global, response, and passed locals
	merge(opts, this.locals, options._locals, options);

	view = this.cache[name];

	if (!view) {
		view = new (this.get('view'))(name, {
			//
		});

		if (!view) {
			var err = new Error('Failed to lookup view ' + name);
			return fn(err);
		}

		// Store
		this.cache[name] = view;
	}

	try {
		view.render(opts, fn);
	} catch (err) {
		err.statusCode = err.status = 500;
		fn(err);
	}
};

/**
 * Change browser history state
 * @param {String} url
 * @param {String} title
 */
Application.prototype.navigateTo = function (url, title) {
	this[this.parent ? 'parent' : 'history'].navigateTo(url, title);
};

/**
 * Force browser location change
 * @param {String} url
 * @param {String} title
 */
Application.prototype.redirectTo = function (url) {
	this[this.parent ? 'parent' : 'history'].redirectTo(url);
};

/**
 * Retrieve current context
 * @returns {Object}
 */
Application.prototype.getCurrentContext = function () {
	return this[this.parent ? 'parent' : 'history'].getCurrentContext();
};