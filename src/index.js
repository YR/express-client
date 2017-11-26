'use strict';

/**
 * An express.js framework for the browser
 * https://github.com/yr/express-client
 * @copyright Yr
 * @license MIT
 */

const { Request } = require('./lib/request');
const { Response } = require('./lib/response');
const application = require('./lib/application');
const Router = require('./lib/router');

/**
 * Application factory
 * @returns {Application}
 */
module.exports = function createApplication() {
  return application();
};

// Expose constructor
module.exports.Router = Router;
// Expose prototypes
module.exports.application = application.Application.prototype;
module.exports.request = Request.prototype;
module.exports.response = Response.prototype;
