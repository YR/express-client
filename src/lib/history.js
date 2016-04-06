'use strict';

/**
 * Manager for browser history.
 * Generates/stores request/response context for current url,
 * and responds to changes to state via History API.
 */

const debug = require('debug')('express:history')
  , urlUtils = require('@yr/url-utils');

let bootstrap = true;

/**
 * Instance factory
 * @param {Function} request
 * @param {Function} response
 * @param {Function} fn(req, res)
 * @returns {History}
 */
module.exports = function (request, response, fn) {
  return new History(request, response, fn);
};

class History {
  /**
   * Constructor
   * @param {Function} request(url)
   * @param {Function} response
   * @param {Function} fn(req, res)
   */
  constructor (request, response, fn) {
    this.cache = {};
    this.current = '';
    this.running = false;
    this.request = request;
    this.response = response;
    this.fn = fn;
    this.onClick = this.onClick.bind(this);
    this.onPopstate = this.onPopstate.bind(this);
    this.navigateTo = this.navigateTo.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
    this.getCurrentContext = this.getCurrentContext.bind(this);
  }

  /**
   * Notify on current context,
   * and begin listening for history changes
   * @returns {History}
   */
  listen () {
    // Handle current history state (triggers notification)
    const ctx = this.handle();

    if (!this.running && ctx) {
      // Test History API availability
      if (hasHistory()) {
        // Delay to prevent premature trigger when navigating back from nothing
        setTimeout(() => {
          window.addEventListener('click', this.onClick, false);
          window.addEventListener('popstate', this.onPopstate, false);
          this.running = true;
        }, 500);

        // Update so that popstate will trigger for this route
        window.history.replaceState({}, document.title);

        debug('listening with history API');
      }
    }

    return this;
  }

  /**
   * Create a new or updated history state at 'url' with 'title'
   * @param {String} url
   * @param {String} title
   * @param {Boolean} isUpdate
   * @param {Boolean} noScroll
   */
  navigateTo (url, title, isUpdate, noScroll) {
    // Only navigate if not same as current
    if (url != urlUtils.getCurrent()) {
      if (this.running) {
        // Will return empty if malformed
        url = urlUtils.encode(url);
        if (!url) return;

        debug('navigate to: %s', url);

        window.history[isUpdate ? 'replaceState' : 'pushState']({}, title, url);
        if (title) document.title = title;
        this.handle(url, noScroll);
      } else {
        this.redirectTo(url);
      }
    }
  }

  /**
   * Stop history management by redirecting to 'url'
   * @param {String} url
   */
  redirectTo (url) {
    this.destroy();
    window.location = urlUtils.encode(url);
  }

  /**
   * Force a re-handle of current context
   */
  refresh () {
    let ctx = this.getCurrentContext();

    // Undo pipeline modifications
    ctx.req.reset();
    ctx.res.reset();
    this.fn(ctx.req, ctx.res);
  }

  /**
   * Retrieve current context
   * @returns {Object}
   */
  getCurrentContext () {
    return this.cache[this.current];
  }

  /**
   * Stop listening for history updates
   */
  destroy () {
    if (this.running) {
      window.removeEventListener('click', this.onClick, false);
      window.removeEventListener('popstate', this.onPopstate, false);
      this.cache = null;
      this.running = false;
    }
  }

  /**
   * Handle history change and notify
   * @param {String} [url]
   * @param {Boolean} [noScroll]
   * @returns {Object}
   */
  handle (url, noScroll) {
    let ctx = {}
      , req, res;

    url = url
      ? urlUtils.encode(url)
      : urlUtils.getCurrent();
    // Error encoding url
    if (!url) return this.redirectTo(url);

    // Do nothing if current url is the same
    if (this.current && this.current === url) return;

    if (this.cache[url]) {
      ctx = this.cache[url];
      req = ctx.req;
      res = ctx.res;
      // Always reset in order to undo pipeline modifications
      req.reset();
      res.reset();
      // Set flag for use downstream
      req.cached = res.cached = true;
      debug('context retrieved from cache: %s', url);
    } else {
      req = this.request(url, bootstrap);
      res = this.response();
      debug('generating new context: %s', url);
    }
    res.req = req;
    ctx.req = req;
    ctx.res = res;
    this.cache[url] = ctx;

    // Abort if current request/response is not finished
    if (this.current && !this.cache[this.current].res.finished) {
      this.cache[this.current].req.abort();
      this.cache[this.current].res.reset();
    }

    // Store reference to current
    this.current = url;

    // Set scroll position to top if not bootstrap or overridden
    if (!bootstrap && !noScroll) window.scrollTo(0, 0);

    this.fn(req, res);

    // Make sure only first request flagged as bootstrap
    bootstrap = false;

    return ctx;
  }

  /**
   * Handle history change via 'popstate' event
   * @param {Object} evt
   */
  onPopstate (evt) {
    // Prevent initial page load from triggering on some platforms when no state
    if (evt.state && this.running) {
      this.handle();
    }
  }

  /**
   * Handle click event
   * @param {Object} evt
   * @returns {null}
   */
  onClick (evt) {
    const which = (null == evt.which) ? evt.button : evt.which;

    let el = evt.target;

    // Modifiers present
    if (which != 1) return;
    if (evt.metaKey || evt.ctrlKey || evt.shiftKey) return;
    if (evt.defaultPrevented) return;

    // Find anchor
    // svg elements on some platforms don't have nodeNames
    while (el && (el.nodeName == null || 'A' != el.nodeName.toUpperCase())) {
      el = el.parentNode;
    }

    // Anchor not found
    if (!el || 'A' != el.nodeName.toUpperCase()) return;

    // Cross origin
    if (!sameOrigin(el.href)) return this.fn(el.href);

    // IE11 prefixes extra slash on absolute links
    const path = (el.pathname + el.search).replace(/\/\//, '/')
      , isSameAsCurrent = (path == urlUtils.getCurrent());

    // Anchor target on same page
    if (isSameAsCurrent && 'string' == typeof el.hash && el.hash) return;

    evt.preventDefault();

    // Same as current
    if (isSameAsCurrent) return;

    // Blur focus
    el.blur();

    debug('click event intercepted from %s', el);
    this.navigateTo(path);
  }
}

/**
 * Test for history API (Modernizr)
 * @returns {Boolean}
 */
function hasHistory () {
  const ua = navigator.userAgent;

  // Stock android browser 2.2 & 2.3 & 4.0.x are buggy, ignore
  if ((ua.indexOf('Android 2.') !== -1
    || (ua.indexOf('Android 4.0') !== -1))
    // Chrome identifies itself as 'Mobile Safari'
    && ua.indexOf('Mobile Safari') !== -1
    && ua.indexOf('Chrome') === -1
    && ua.indexOf('Windows Phone') === -1) {
      return false;
  }

  // Usual test
  return (window.history && 'pushState' in window.history);
}

/**
 * Check if 'url' is from same origin
 * @param {String} url
 * @returns {Boolean}
 */
function sameOrigin (url) {
  let origin = location.protocol + '//' + location.hostname;

  if (location.port) origin += ':' + location.port;
  return (url && (url.indexOf(origin) == 0));
}