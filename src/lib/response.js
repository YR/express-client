'use strict';

const cookieLib = require('cookie');
const Emitter = require('eventemitter3');

class Response extends Emitter {
  /**
   * Constructor
   * @param {Request} req
   */
  constructor(req) {
    super();

    this.app = null;
    this.cached = false;
    this.finished = false;
    this.locals = {};
    this.req = req;
    this.statusCode = 404;
  }

  /**
   * Set cookie
   * @param {String} name
   * @param {String|Object} val
   * @param {Object} options
   * @returns {Response}
   */
  cookie(name, val, options) {
    // Clone
    options = Object.assign({}, options);

    const type = typeof val;

    if (type === 'number') {
      val = val.toString();
    }
    if (type === 'object') {
      val = `j:${JSON.stringify(val)}`;
    }

    if ('maxAge' in options) {
      options.expires = new Date(Date.now() + options.maxAge);
      options.maxAge /= 1000;
    }

    if (options.path == null) {
      options.path = '/';
    }

    document.cookie = cookieLib.serialize(name, String(val), options);

    return this;
  }

  /**
   * Set status 'code'
   * @param {Number} code
   * @returns {Response}
   */
  status(code) {
    this.statusCode = code;
    return this;
  }

  /**
   * Send response
   */
  send() {
    this.end();
  }

  /**
   * End response (last method called in pipeline)
   */
  end() {
    // Reset state
    this.req && this.req.reset();
    this.status(200);
    this.finished = true;
    this.emit('finish');
  }

  /**
   * Partial response (noop)
   */
  write() {}

  /**
   * Redirect to 'url'
   * @param {Number} [statusCode]
   * @param {String} url
   */
  redirect(statusCode, url) {
    this.app.redirectTo(statusCode, url);
  }

  /**
   * Reset state
   */
  reset() {
    this.cached = false;
    this.finished = false;
    this.locals = {};
    this.req = null;
    this.statusCode = 404;
  }

  /**
   * Abort response
   */
  abort() {
    this.req && this.req.abort();
    this.reset();
    this.emit('close');
  }
}

/**
 * Instance factory
 * @returns {Response}
 */
module.exports = function() {
  return new Response();
};
module.exports.Response = Response;
