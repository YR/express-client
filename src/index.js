'use strict';

/**
 * An express.js framework for the browser
 * https://github.com/yr/express-client
 * @copyright Yr
 * @license MIT
 */

const application = require('./lib/application')
  , Router = require('./lib/router');

module.exports = createApplication;

/**
 * Application factory
 * @returns {Application}
 */
function createApplication () {
  return application();
}

/**
 * Expose
 */
module.exports.Router = Router;