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

    this.settings = {
      env: process.env.NODE_ENV || 'development'
    };
    this.cache = {};
    this.locals = {};
    this.mountpath = '/';
    this._router = router({
      caseSensitive: false,
      strict: false,
      mergeParams: true
    });
    this.parent = null;

    this.handle = this.handle.bind(this);
    this.handleExternalLink = this.handleExternalLink.bind(this);
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

    this.history = history(requestFactory, responseFactory, this.handle, this.handleExternalLink);

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
      if (fn instanceof Application) {
        const app = fn;
        const handler = app.handle;

        app.mountpath = path;
        app.parent = this;
        fn = function mounted_app(req, res, next) {
          // Change app reference to mounted
          const orig = req.app;

          req.app = res.app = app;
          handler(req, res, function(err) {
            // Restore app reference when done
            req.app = res.app = orig;
            next(err);
          });
        };
      }

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
    if (!this.parent) {
      this.history.listen();
    }
  }

  /**
   * Run request/response through router's middleware pipline
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done
   */
  handle(req, res, done) {
    // Handle external link
    if (typeof req === 'string') {
      this.emit('link:external', req);
    } else {
      this.emit('connect', req);
      this.emit('request', req, res);
      this._router.handle(req, res, done || NOOP);
    }
  }

  /**
   * Handle external link
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done
   */
  handleExternalLink(url, data) {
    this.emit('link:external', url, data);
  }

  /**
   * Change/update browser history state
   * @param {String} url
   * @param {String} title
   * @param {Boolean} isUpdate
   * @param {Boolean} noScroll
   */
  navigateTo(url, title, isUpdate, noScroll) {
    this[this.parent ? 'parent' : 'history'].navigateTo(url, title, isUpdate, noScroll);
  }

  /**
   * Redirect to new 'url'
   * @param {Number} [status]
   * @param {String} url
   */
  redirectTo(status, url) {
    if (this.parent) {
      return void this.parent.redirectTo(status, url);
    }

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
    return this[this.parent ? 'parent' : 'history'].getCurrentContext();
  }

  /**
   * Reload current location
   */
  reload() {
    this[this.parent ? 'parent' : 'history'].reload();
  }
}

/**
 * Instance factory
 * @returns {Application}
 */
module.exports = function() {
  return new Application();
};
