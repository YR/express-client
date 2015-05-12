/**
 * Browser request object
 */

var cookie = require('cookie')
	, emitter = require('eventemitter3')
	, merge = require('lodash-compat/object/merge')
	, qsParse = require('query-string').parse
	, urlUtils = require('@yr/url-utils');

module.exports = Request;

/**
 * Constructor
 * @param {String} url
 * @param {Boolean} bootstrap
 */
function Request (url, bootstrap) {
	if (!(this instanceof Request)) {
		return new Request(url, bootstrap);
	}

	url = url
		? urlUtils.encode(url)
		: urlUtils.getCurrent();

	var path = url.split('?')
		, qs = path[1] || '';

	this.app;
	this.cookies = cookie.parse(document.cookie);
	this.path = urlUtils.sanitize(path[0]);
	this.query = qsParse(qs);
	this.querystring = qs;
	this.search = qs ? '?' + qs : '';
	this.url = this.originalUrl = url;
	this.reset(bootstrap);

	merge(this, emitter.prototype);
}

/**
 * Abort response
 */
Request.prototype.abort = function () {
	this.reset();
	this.emit('close');
};

/**
 * Reset state
 * @param {Boolean} bootstrap
 */
Request.prototype.reset = function (bootstrap) {
	this.baseUrl = '';
	this.bootstrap = bootstrap || false;
	this.cached = false;
	this.path = urlUtils.sanitize(this.originalUrl.split('?')[0]);
	this.params = null;
};
