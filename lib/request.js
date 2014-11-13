/**
 * Browser request object
 */

var qsParse = require('query-string').parse
	, urlUtils = require('url-utils');

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

	this.bootstrap = bootstrap;
	this.url = this.originalUrl = url;
	this.path = urlUtils.sanitize(path[0]);
	this.querystring = qs;
	this.search = qs ? '?' + qs : '';
	this.query = qsParse(qs);
	this.cached = false;
	this.app;
}