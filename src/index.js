'use strict';

/**
 * An express.js framework for the browser
 * https://github.com/yr/express-client
 * @copyright Yr
 * @license MIT
 */

const application = require('./lib/application');
const Router = require('./lib/router');

/**
 * Application factory
 * @returns {Application}
 */
module.exports = function createApplication () {
  return application();
};

/**
 * Expose
 */
module.exports.Router = Router;