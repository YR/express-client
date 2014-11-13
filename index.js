var application = require('./lib/application')
	, Router = require('./lib/router');

module.exports = createApplication;

/**
 * Application factory
 */
function createApplication () {
	return application();
};

/**
 * Expose
 */
module.exports.Router = Router;