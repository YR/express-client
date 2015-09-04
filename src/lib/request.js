'use strict';

/**
 * Browser request object
 */

const assign = require('object-assign')
  , cookie = require('cookie')
  , Emitter = require('eventemitter3')
  , qsParse = require('query-string').parse
  , urlUtils = require('@yr/url-utils');

/**
 * Instance factory
 * @param {String} url
 * @param {Boolean} bootstrap
 */
module.exports = function (url, bootstrap) {
  return new Request(url, bootstrap);
};

class Request extends Emitter {
  /**
   * Constructor
   * @param {String} url
   * @param {Boolean} bootstrap
   */
  constructor (url, bootstrap) {
    super();

    url = url
      ? urlUtils.encode(url)
      : urlUtils.getCurrent();

    const path = url.split('?')
      , qs = path[1] || '';

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
  abort () {
    this.reset();
    this.emit('close');
  }

  /**
   * Reset state
   * @param {Boolean} bootstrap
   */
  reset (bootstrap) {
    this.baseUrl = '';
    this.bootstrap = bootstrap || false;
    this.cached = false;
    this.path = urlUtils.sanitize(this.originalUrl.split('?')[0]);
    this.params = null;
  }
}