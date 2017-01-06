'use strict';

const assign = require('object-assign');
const cookieLib = require('cookie');
const Emitter = require('eventemitter3');

class Response extends Emitter {
  /**
   * Constructor
   */
  constructor () {
    super();

    this.app = null;
    this.cached = false;
    this.finished = false;
    this.locals = {};
    this.req = null;
    this.statusCode = 404;
  }

  /**
   * Reset state
   */
  reset () {
    this.cached = false;
    this.finished = false;
    this.locals = {};
    this.req = null;
    this.statusCode = 404;
  }

  /**
   * Set status 'code'
   * @param {Number} code
   * @returns {Response}
   */
  status (code) {
    this.statusCode = code;
    return this;
  }

  /**
   * Send response (last method called in pipeline)
   */
  send () {
    // Reset state
    this.req.reset();
    this.status(200);
    this.finished = true;
    this.emit('finish');
  }

  /**
   * Partial response (noop)
   */
  write () { }

  /**
   * Abort response
   */
  abort () {
    this.req.abort();
    this.reset();
    this.emit('close');
  }

  /**
   * Redirect to 'url'
   * @param {Number} statusCode
   * @param {String} url
   */
  redirect (statusCode, url) {
    this.app.redirectTo(url || statusCode);
  }

  /**
   * Set cookie
   * @param {String} name
   * @param {String|Object} val
   * @param {Object} options
   * @returns {Response}
   */
  cookie (name, val, options) {
    // Clone
    options = assign({}, options);

    if ('number' == typeof val) val = val.toString();
    if ('object' == typeof val) val = 'j:' + JSON.stringify(val);

    if ('maxAge' in options) {
      options.expires = new Date(Date.now() + options.maxAge);
      options.maxAge /= 1000;
    }

    if (options.path == null) options.path = '/';

    document.cookie = cookieLib.serialize(name, String(val), options);

    return this;
  }
}

/**
 * Instance factory
 * @returns {Response}
 */
module.exports = function () {
  return new Response();
};
module.exports.Response = Response;