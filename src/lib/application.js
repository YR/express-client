'use strict';

const debugFactory = require('debug');
const Emitter = require('eventemitter3');
const history = require('./history');
const request = require('./request');
const response = require('./response');
const router = require('./router');

const NOOP = function() {};

const debug = debugFactory('express:application');

class Application extends Emitter {
  /**
   * Constructor
   */
  constructor() {
    super();

    this.cache = {};
    this.engines = {};
    this.locals = {};
    this.settings = {
      env: process.env.NODE_ENV || 'development'
    };
    this._router = router({
      caseSensitive: false,
      strict: false,
      mergeParams: true
    });

    this.handle = this.handle.bind(this);
    this.navigateTo = this.navigateTo.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
    this.getCurrentContext = this.getCurrentContext.bind(this);
    this.reload = this.reload.bind(this);

    // Create request/response factories
    const app = this;
    const requestFactory = function requestFactory(url, bootstrap) {
      const req = request(url, bootstrap);

      req.app = app;
      return req;
    };
    const responseFactory = function responseFactory() {
      const res = response();

      res.app = app;
      return res;
    };

    this.history = history(requestFactory, responseFactory, this.handle);

    // Route ALL/POST methods to router
    this.all = this._router.all.bind(this._router);
    this.post = this._router.post.bind(this._router);
  }

  /**
   * Store 'value' for 'key'
   * @param {String} key
   * @param {Object} [value]
   * @returns {*}
   */
  set(key, value) {
    // get()
    if (arguments.length === 1) {
      return this.settings[key];
    }

    this.settings[key] = value;
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
      debug('adding application middleware layer with path %s', path);
      this._router.use(path, fn);
    });
  }

  /**
   * Add GET at 'path' with strict matching of path
   * @param {String} path
   * @returns {Object}
   */
  get(path, ...args) {
    // Not verb, only get/set
    if (!args.length) {
      return this.set(path);
    }

    this._router.get(path, ...args);

    return this;
  }

  /**
   * Handle param 'name' with 'fn'
   * @param {String} name
   * @param {Function} fn(req, res, next, value)
   */
  param(name, fn) {
    this._router.param(name, fn);
  }

  /**
   * Start listening for requests
   */
  listen() {
    this.history.listen();
  }

  /**
   * Change/update browser history state
   * @param {String} url
   * @param {String} [title]
   * @param {Boolean} [isUpdate]
   * @param {Boolean} [noScroll]
   */
  navigateTo(url, title, isUpdate, noScroll) {
    this.history.navigateTo(url, title, isUpdate, noScroll);
  }

  /**
   * Redirect to new 'url'
   * @param {Number} [status]
   * @param {String} url
   */
  redirectTo(status, url) {
    // TODO: parse url and check for absolute/relative
    if (!url) {
      url = status;
      status = 404;
    }
    // Force browser to handle
    if (status >= 400) {
      this.history.redirectTo(url);
      // Handle internally
    } else {
      this.history.navigateTo(url);
    }
  }

  /**
   * Retrieve current context
   * @returns {Object}
   */
  getCurrentContext() {
    return this.history.getCurrentContext();
  }

  /**
   * Render application view
   * @param {String} name
   * @param {Object|Function} options or done
   * @param {Function} [done]
   */
  render(name, options, done) {
    const opts = {};
    const view = this.cache[name];

    if (typeof options === 'function') {
      done = options;
      options = {};
    }

    Object.assign(opts, this.locals, options);

    if (!view) {
      throw Error(
        `no view for ${name}. View renderers need to be manually cached with app.cache[name] = {render(options, done)}`
      );
    }

    try {
      view.render(options, done);
    } catch (err) {
      done(err);
    }
  }

  /**
   * Rerender application view
   */
  rerender() {
    throw Error('rerender() method not implemented. Extend the Application prototype with behaviour');
  }

  /**
   * Reload current location
   */
  reload() {
    this.history.reload();
  }

  /**
   * Run request/response through router's middleware pipline
   * @param {Request} req
   * @param {Response} res
   * @param {Function} [done]
   * @param {String} [action]
   * @param {String} [name]
   */
  handle(req, res, done = NOOP, action = 'handle', name = 'default') {
    if (action === 'external') {
      this.emit('link:external', req, res);
    } else {
      this.emit('connect', req);
      this.emit('request', req, res);
      this._router.handle(
        req,
        res,
        done,
        // Skip handling if action is 'render' or 'rerender'
        action !== 'handle'
          ? (req, res) => {
              if (action === 'render') {
                res.render(name);
              } else {
                this.rerender();
              }
            }
          : undefined
      );
    }
  }
}

/**
 * Instance factory
 * @returns {Application}
 */
module.exports = function applicationFactory() {
  return new Application();
};
module.exports.Application = Application;
