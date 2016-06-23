'use strict';

/**
 * Router for handling middleware pipeline.
 * Can be isolated under a specific mount path.
 */

const assign = require('object-assign');
const Debug = require('debug');
const layer = require('./layer');
const urlUtils = require('@yr/url-utils');

const DEFAULT_OPTIONS = {
  mergeParams: true,
  caseSensitive: false,
  strict: false
};

const debug = Debug('express:router');

/**
 * Instance factory
 * @param {Object} [options]
 * @returns {Router}
 */
module.exports = function (options) {
  return new Router(options);
};

class Router {
  /**
   * Constructor
   * @param {Object} [options]
   */
  constructor (options) {
    options = assign({}, DEFAULT_OPTIONS, options);

    const boundMethod = this.method.bind(this);

    this.all = boundMethod;
    this.get = boundMethod;
    this.post = boundMethod;
    this.handle = this.handle.bind(this);
    this.stack = [];
    this.mergeParams = options.mergeParams;
    // Init matcher options
    this.matcherOpts = {
      sensitive: options.caseSensitive,
      strict: options.strict,
      end: false
    };
    this.strictMatcherOpts = {
      sensitive: options.caseSensitive,
      strict: options.strict,
      end: true
    };
    this.params = null;
  }

  /**
   * Handle param 'name' with 'fn'
   * @param {String} name
   * @param {Function} fn(req, res, next, value)
   */
  param (name, fn) {
    if (!this.params) this.params = {};
    this.params[name] = fn;
  }

  /**
   * Add one or more 'fn' to middleware pipeline at optional 'path'
   */
  use (...fns) {
    let offset = 0;
    let path = '/';

    if ('string' == typeof fns[0]) {
      offset = 1;
      path = fns[0];
    }

    fns
      .slice(offset)
      .forEach((fn) => {
        if (fn instanceof Router) {
          fn = fn.handle;
        }
        const lyr = layer(path, fn, this.matcherOpts);

        debug('adding router middleware %s with path %s', lyr.name, path);
        this.stack.push(lyr);
      });
  }

  /**
   * Register method at 'path'
   * @param {String} path
   */
  method (path, ...fns) {
    fns.forEach((fn) => {
      let lyr = layer(path, fn, this.strictMatcherOpts);

      lyr.route = true;

      debug('adding router route %s with path %s', lyr.name, path);
      this.stack.push(lyr);
    });
  }

  /**
   * Run request/response through middleware pipline
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done
   */
  handle (req, res, done) {
    const self = this;
    const parentUrl = req.baseUrl || '';
    let idx = 0;
    let processedParams = {};
    let removed = '';

    // Update done to restore req props
    done = restore(done, req, 'baseUrl', 'next', 'params');

    // Setup next layer
    req.next = next;
    req.baseUrl = parentUrl;

    next();

    function next (err) {
      const lyr = self.stack[idx++];
      const layerErr = err;

      if (removed.length != 0) {
        debug('untrim %s from url %s', removed, req.path);
        req.baseUrl = parentUrl;
        req.path = urlUtils.join(removed, req.path);
        removed = '';
      }

      // Exit
      if (!lyr) return done(layerErr);

      // Skip if no match or err and route layer
      if (!lyr.match(req.path) || layerErr && !lyr.fastmatch) return next(layerErr);

      debug('%s matched layer %s with path %s', req.path, lyr.name, lyr.path);

      // Store params
      if (self.mergeParams) {
        if (!req.params) req.params = {};
        assign(req.params, lyr.params);
      } else {
        req.params = lyr.params;
      }

      // Process params if necessary
      self._processParams(processedParams, req.params, Object.keys(lyr.params), req, res, (err) => {
        if (err) return next(layerErr || err);
        if (!lyr.route) trim(lyr);
        if (layerErr) {
          lyr.handleError(layerErr, req, res, next);
        } else {
          lyr.handleRequest(req, res, next);
        }
      });
    }

    function trim (layer) {
      if (layer.path.length != 0) {
        debug('trim %s from url %s', layer.path, req.path);
        removed = layer.path;
        req.path = req.path.substr(removed.length);
        if (req.path.charAt(0) != '/') req.path = '/' + req.path;

        req.baseUrl = urlUtils.join(parentUrl, removed);
      }
    }
  }

  /**
   * Process middleware matched parameters
   * @param {Object} processedParams
   * @param {Object} params
   * @param {Array} keys
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done(err)
   */
  _processParams (processedParams, params, keys, req, res, done) {
    const self = this;
    let idx = 0;

    function next (err) {
      // Stop processing on any error
      if (err) return done(err);

      if (idx >= keys.length) return done();

      const name = keys[idx++];
      const fn = self.params[name];

      // Process if match and not already processed
      if (fn && !processedParams[name]) {
        processedParams[name] = true;
        fn(req, res, next, params[name]);
      } else {
        next();
      }
    }

    if (this.params && keys.length) {
      next();
    } else {
      done();
    }
  }
}

/**
 * Restore 'obj' props
 * @param {Function} fn
 * @param {Object} obj
 * @returns {Function}
 */
function restore (fn, obj) {
  let props = new Array(arguments.length - 2);
  let vals = new Array(arguments.length - 2);

  for (let i = 0; i < props.length; i++) {
    props[i] = arguments[i + 2];
    vals[i] = obj[props[i]];
  }

  return function () {
    // Restore vals
    for (let i = 0; i < props.length; i++) {
      obj[props[i]] = vals[i];
    }

    return fn.apply(this, arguments);
  };
}