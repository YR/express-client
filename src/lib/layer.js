'use strict';

/**
 * Router layer object
 */

const matcher = require('path-to-regexp')
  , urlUtils = require('@yr/url-utils');

/**
 * Instance Factory
 * @param {String} path
 * @param {Function} fn
 * @param {Object} options
 * @returns {Layer}
 */
module.exports = function (path, fn, options) {
  return new Layer(path, fn, options);
};

class Layer {
  /**
   * Constructor
   * @param {String} path
   * @param {Function} fn
   * @param {Object} options
   */
  constructor (path, fn, options) {
    // To be filled by matcher
    this.keys = [];
    this.path = null;
    this.params = null;
    this.fn = fn;
    this.name = fn.name ? '<' + fn.name + '>' : '<anonymous>';
    this.fastmatch = (path == '/' && !options.end);
    this.regexp = matcher(path, this.keys, options);
  }

  /**
   * Determine if this route matches 'path'
   * @param {String} path
   * @returns {Boolean}
   */
  match (path) {
    if (this.fastmatch) {
      this.params = {};
      this.path = '';
      return true;
    }

    const mtch = this.regexp.exec(path);

    if (!mtch) {
      this.params = null;
      this.path = null;
      return false;
    }

    this.params = {};
    this.path = mtch[0];

    let n = 0
      , key, val;

    for (let i = 1, len = mtch.length; i < len; ++i) {
      key = this.keys[i - 1];
      val = urlUtils.decode(mtch[i]);

      if (key) {
        this.params[key.name] = val;
      } else {
        this.params[n++] = val;
      }
    }

    return true;
  }

  /**
   * Handle
   * @param {Error} err
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @returns {null}
   */
  handle (err, req, res, next) {
    if (err) {
      // Only call if it handles errors
      return (this.fn.length > 3)
        ? this.fn(err, req, res, next)
        : next(err);
    }

    // Skip if error handler
    return (this.fn.length < 4)
      ? this.fn(req, res, next)
      : next();
  }
}