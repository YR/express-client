'use strict';

/**
 * Browser request object
 */

var assign = require('object-assign'),
    cookie = require('cookie'),
    Emitter = require('eventemitter3'),
    qsParse = require('query-string').parse,
    urlUtils = require('@yr/url-utils');

/**
 * Instance factory
 * @param {String} url
 * @param {Boolean} bootstrap
 */
module.exports = function (url, bootstrap) {
	return new Request(url, bootstrap);
};

var Request = (function (_Emitter) {
	babelHelpers.inherits(Request, _Emitter);

	/**
  * Constructor
  * @param {String} url
  * @param {Boolean} bootstrap
  */

	function Request(url, bootstrap) {
		babelHelpers.classCallCheck(this, Request);

		_Emitter.call(this);

		url = url ? urlUtils.encode(url) : urlUtils.getCurrent();

		var path = url.split('?'),
		    qs = path[1] || '';

		this.app;
		this.cookies = cookie.parse(document.cookie);
		this.path = urlUtils.sanitize(path[0]);
		this.query = qsParse(qs);
		this.querystring = qs;
		this.search = qs ? '?' + qs : '';
		this.url = this.originalUrl = url;
		this.reset(bootstrap);
	}

	/**
  * Abort response
  */

	Request.prototype.abort = function abort() {
		this.reset();
		this.emit('close');
	};

	/**
  * Reset state
  * @param {Boolean} bootstrap
  */

	Request.prototype.reset = function reset(bootstrap) {
		this.baseUrl = '';
		this.bootstrap = bootstrap || false;
		this.cached = false;
		this.path = urlUtils.sanitize(this.originalUrl.split('?')[0]);
		this.params = null;
	};

	return Request;
})(Emitter);