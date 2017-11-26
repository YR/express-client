'use strict';

const Debug = require('debug');
const layer = require('./layer');

const DEFAULT_OPTIONS = {
  mergeParams: true,
  caseSensitive: false,
  strict: false
};

const debug = Debug('express:router');

class Router {
  /**
   * Constructor
   * @param {Object} [options]
   */
  constructor(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

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
  param(name, fn) {
    if (!this.params) {
      this.params = {};
    }
    this.params[name] = fn;
  }

  /**
   * Add one or more 'fn' to middleware pipeline at optional 'path'
   */
  use(...fns) {
    let offset = 0;
    let path = '/';

    if (typeof fns[0] === 'string') {
      offset = 1;
      path = fns[0];
    }

    fns.slice(offset).forEach(fn => {
      const lyr = layer(path, fn, this.matcherOpts);

      debug('adding router middleware %s with path %s', lyr.name, path);
      this.stack.push(lyr);
    });
  }

  /**
   * Register method at 'path'
   * @param {String} path
   */
  method(path, ...fns) {
    fns.forEach(fn => {
      const lyr = layer(path, fn, this.strictMatcherOpts);

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
   * @param {Function} [optionalFn]
   */
  handle(req, res, done /*, optionalFn */) {
    const self = this;
    // Function.length is used to detect error handlers, so need to implicitly handle optionalFn
    const optionalFn = arguments[3];
    const parentUrl = req.baseUrl || '';
    const processedParams = {};
    let idx = 0;

    // Setup next layer
    req.next = next;
    req.baseUrl = parentUrl;

    next();

    function next(err) {
      const lyr = self.stack[idx++];
      const layerErr = err;

      // Exit, no more layers to match
      if (!lyr) {
        return void done(layerErr);
      }

      // Skip if no match or err and route layer
      if (!lyr.match(req.path) || (layerErr && !lyr.fastmatch)) {
        return void next(layerErr);
      }

      debug('%s matched layer %s with path %s', req.path, lyr.name, lyr.path);

      // Store params
      if (self.mergeParams) {
        if (!req.params) {
          req.params = {};
        }
        Object.assign(req.params, lyr.params);
      } else {
        req.params = lyr.params;
      }

      // Process params if necessary
      self._processParams(processedParams, req.params, Object.keys(lyr.params), req, res, err => {
        if (err) {
          return next(layerErr || err);
        }
        if (layerErr) {
          lyr.handleError(layerErr, req, res, next);
        } else {
          lyr.handleRequest(req, res, next, optionalFn);
        }
      });
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
  _processParams(processedParams, params, keys, req, res, done) {
    const self = this;
    let idx = 0;

    function next(err) {
      // Stop processing on any error
      if (err) {
        return void done(err);
      }

      if (idx >= keys.length) {
        return void done();
      }

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
 * Instance factory
 * @param {Object} [options]
 * @returns {Router}
 */
module.exports = function routerFactory(options) {
  return new Router(options);
};
