'use strict';

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