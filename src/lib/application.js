'use strict';

/**
 * Browser application
 */

const debug = require('debug')('express:application')
  , Emitter = require('eventemitter3')
  , history = require('./history')
  , request = require('./request')
  , response = require('./response')
  , router = require('./router');

/**
 * Instance factory
 * @returns {Application}
 */
module.exports = function () {
  return new Application();
};

class Application extends Emitter {
  /**
   * Constructor
   */
  constructor () {
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
    this.navigateTo = this.navigateTo.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
    this.getCurrentContext = this.getCurrentContext.bind(this);
    this.refresh = this.refresh.bind(this);

    // Create request/response factories
    const app = this
      , req = function (url, bootstrap) {
          let req = request(url, bootstrap);
          req.app = app;
          return req;
        }
      , res = function () {
          var res = response();
          res.app = app;
          return res;
        };

    this.history = history(req, res, this.handle);

    // Route ALL/POST methods to router
    this.all = this._router.all.bind(this._router);
    this.post = this._router.post.bind(this._router);
  }

  /**
   * Store 'value' for 'key'
   * @param {String} key
   * @param {Object} value
   * @returns {Object}
   */
  set (key, value) {
    // get()
    if (arguments.length == 1) return this.settings[key];

    this.settings[key] = value;
  }

  /**
   * Add one or more 'fn' to middleware pipeline at optional 'path'
   * @param {Function} fn(req, res, next)
   */
  use (/* path, */ fn /* ...fn */) {
    let offset = 0
      , path = '/'
      , fns;

    if ('string' == typeof fn) {
      offset = 1;
      path = fn;
    }

    fns = Array.prototype.slice.call(arguments, offset);

    fns.forEach(function (fn) {
      if (fn instanceof Application) {
        let app = fn
          , handler = app.handle;

        app.mountpath = path;
        app.parent = this;
        fn = function mounted_app (req, res, next) {
          // Change app reference to mounted
          const orig = req.app;

          req.app = res.app = app;
          handler(req, res, function (err) {
            // Restore app reference when done
            req.app = res.app = orig;
            next(err);
          });
        };
      }

      debug('adding application middleware layer with path %s', path);
      this._router.use(path, fn);
    }, this);
  }

  /**
   * Add GET at 'path' with strict matching of path
   * @param {String} path
   * @returns {Object}
   */
  get (path) {
    // Not verb, only get/set
    if (arguments.length == 1) return this.set(path);

    this._router.get.apply(this._router, Array.prototype.slice.call(arguments));

    return this;
  }

  /**
   * Handle param 'name' with 'fn'
   * @param {String} name
   * @param {Function} fn(req, res, next, value)
   */
  param (name, fn) {
    this._router.param(name, fn);
  }


  /**
   * Start listening for requests
   */
  listen () {
    if (!this.parent) this.history.listen();
  }

  /**
   * Run request/response through router's middleware pipline
   * @param {Request} req
   * @param {Response} res
   * @param {Function} done
   */
  handle (req, res, done) {
    // Handle external link
    if ('string' == typeof req) {
      super.emit('link:external', req);
    } else {
      this._router.handle(req, res, done || function () { });
    }
  }

  /**
   * Change/update browser history state
   * @param {String} url
   * @param {String} title
   * @param {Boolean} isUpdate
   * @param {Boolean} noScroll
   */
  navigateTo (url, title, isUpdate, noScroll) {
    this[this.parent ? 'parent' : 'history'].navigateTo(url, title, isUpdate, noScroll);
  }

  /**
   * Force browser location change
   * @param {String} url
   * @param {String} title
   */
  redirectTo (url) {
    this[this.parent ? 'parent' : 'history'].redirectTo(url);
  }

  /**
   * Retrieve current context
   * @returns {Object}
   */
  getCurrentContext () {
    return this[this.parent ? 'parent' : 'history'].getCurrentContext();
  }

  /**
   * Refresh current location
   */
  refresh () {
    this[this.parent ? 'parent' : 'history'].refresh();
  }
}