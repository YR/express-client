/**
 * Manager for browser history.
 * Generates/stores request/response context for current url,
 * and responds to changes to state via History API.
 */

var bind = require('lodash-compat/function/bind')
	, debug = require('debug')('express:history')
	, urlUtils = require('@yr/url-utils')
	, bootstrap = true;

module.exports = History;

/**
 * Constructor
 * @param {Function} request(url)
 * @param {Function} response
 * @param {Function} fn(req, res)
 */
function History (request, response, fn) {
	if (!(this instanceof History)) {
		return new History(request, response, fn);
	}

	this.cache = {};
	this.current = '';
	this.running = false;
	this.request = request;
	this.response = response;
	this.fn = fn;
	this.onClick = bind(this.onClick, this);
	this.onPopstate = bind(this.onPopstate, this);
	this.navigateTo = bind(this.navigateTo, this);
	this.redirectTo = bind(this.redirectTo, this);
	this.getCurrentContext = bind(this.getCurrentContext, this);
}

/**
 * Notify on current context,
 * and begin listening for history changes
 * @returns {History}
 */
History.prototype.listen = function () {
	// Handle current history state (triggers notification)
	var ctx = this.handle();

	if (!this.running && ctx) {
		// Test History API availability
		if (hasHistory()) {
			var self = this;
			// Delay to prevent premature trigger when navigating back from nothing
			setTimeout(function () {
				window.addEventListener('click', self.onClick, false);
				window.addEventListener('popstate', self.onPopstate, false);
				self.running = true;
			}, 500);

			// Update so that popstate will trigger for this route
			window.history.replaceState({}, document.title);

			debug('listening with history API');
		}
	}

	return this;
};

/**
 * Create a new or updated history state at 'url' with 'title'
 * @param {String} url
 * @param {String} title
 * @param {Boolean} isUpdate
 */
History.prototype.navigateTo = function (url, title, isUpdate) {
	// Only navigate if not same as current
	if (url != urlUtils.getCurrent()) {
		if (this.running) {
			// Will throw if malformed
			url = urlUtils.encode(url);

			debug('navigate to: %s', url);

			window.history[isUpdate ? 'replaceState' : 'pushState']({}, title, url);
			if (title) document.title = title;
			this.handle(url);
		} else {
			this.redirectTo(url);
		}
	}
};

/**
 * Stop history management by redirecting to 'url'
 * @param {String} url
 */
History.prototype.redirectTo = function (url) {
	this.destroy();
	window.location = urlUtils.encode(url);
};

/**
 * Retrieve current context
 * @returns {Object}
 */
History.prototype.getCurrentContext = function () {
	return this.cache[this.current];
};

/**
 * Stop listening for history updates
 */
History.prototype.destroy = function () {
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
 * @param {State} [state]
 * @returns {Object}
 */
History.prototype.handle = function (url) {
	var ctx = {}
		, req, res;

	try {
		url = url
			? urlUtils.encode(url)
			: urlUtils.getCurrent();
	} catch (err) {
		// Error encoding url
		return this.redirectTo(url);
	}

	// Do nothing if current url is the same
	if (this.current && this.current === url) return;

	// Always create new instance in order to reset express pipeline modifications
	req = this.request(url, bootstrap);
	if (this.cache[url]) {
		ctx = this.cache[url];
		res = ctx.res;
		// Set flag for use downstream
		req.cached = res.cached = true;
		debug('context retrieved from cache: %s', url);
	} else {
		res = this.response();
		debug('generating new context: %s', url);
	}
	res.req = req;
	ctx.req = req;
	ctx.res = res;
	this.cache[url] = ctx;

	// Make sure only first request flagged as bootstrap
	bootstrap = false;

	// Abort if current request/response is not finished
	if (this.current && !this.cache[this.current].res.finished) {
		this.cache[this.current].req.abort();
	}

	// Store reference to current
	this.current = url;

	this.fn(req, res);

	return ctx;
};

/**
 * Handle history change via 'popstate' event
 * @param {Object} evt
 */
History.prototype.onPopstate = function (evt) {
	// Prevent initial page load from triggering on some platforms when no state
	if (evt.state && this.running) {
		this.handle();
	}
};

/**
 * Handle click event
 * @param {Object} evt
 */
History.prototype.onClick = function (evt) {
	var which = (null == evt.which)
			? evt.button
			: evt.which
		, el = evt.target;

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
	if (!sameOrigin(el.href)) return;

	var path = el.pathname + el.search;

	evt.preventDefault();

	// Same as current
	if (path == urlUtils.getCurrent()) return;

	debug('click event intercepted from %s', el);
	// TODO: what about title?
	this.navigateTo(path);
};

/**
 * Test for history API (Modernizr)
 * @returns {Boolean}
 */
function hasHistory () {
	var ua = navigator.userAgent;

	// Stock android browser 2.2 & 2.3 & 4.0.x are buggy, ignore
	if ((ua.indexOf('Android 2.') !== -1
		|| (ua.indexOf('Android 4.0') !== -1))
		// Chrome identifies itself as 'Mobile Safari'
		&& ua.indexOf('Mobile Safari') !== -1
		&& ua.indexOf('Chrome') === -1) {
			return false;
	}

	// Usual test
	return (window.history && 'pushState' in window.history);
}

/**
 * Check if 'url' is from same origin
 * @param {String} url
 * @returns {Boolean}
 */
function sameOrigin (url) {
	var origin = location.protocol + '//' + location.hostname;
	if (location.port) origin += ':' + location.port;
	return (url && (url.indexOf(origin) == 0));
}