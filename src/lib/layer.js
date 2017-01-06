'use strict';

const matcher = require('path-to-regexp');
const urlUtils = require('@yr/url-utils');

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

    let n = 0;
    let key, val;

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
   * Handle error
   * @param {Error} err
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @returns {null}
   */
  handleError (err, req, res, next) {
    // Only call if it handles errors
    if (this.fn.length !== 4) return next(err);

    try {
      this.fn(err, req, res, next);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Handle
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @returns {null}
   */
  handleRequest (req, res, next) {
    // Skip if error handler
    if (this.fn.length > 3) return next();

    try {
      this.fn(req, res, next);
    } catch (err) {
      next(err);
    }
  }
}

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