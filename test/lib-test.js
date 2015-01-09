var express = require('express-client')
	, Application = require('lib/application')
	, Request = require('lib/request')
	, Response = require('lib/response')
	, Router = require('lib/router')
	, History = require('lib/history')
	, expect = window.expect
	, historyApp;

describe('express-client', function () {
	describe('application factory', function () {
		it('should return an application middleware function', function () {
			expect(express()).to.be.a(Application);
		});
		it('should store the app instance on the Request/Response instance', function () {
			var app = express()
				, req = app.history.request();
			expect(req.app).to.be(app);
		});
	});

	describe('Router', function () {
		describe('use()', function () {
			it('should register a simple middleware function', function () {
				var router = Router()
					, fn = function (req, res, next) { };

				router.use(fn);
				expect(router.stack[0]).to.have.property('fn', fn);
			});
			it('should register a simple middleware function at a specified path', function () {
				var router = Router()
					, fn = function (req, res, next) { }
					, path = '/foo';

				router.use(path, fn);
				expect(router.stack[0]).to.have.property('fn', fn);
				expect(router.stack[0].regexp.exec(path)).to.be.ok();
			});
			it('should register multiple middleware functions at a specified path', function () {
				var router = Router()
					, fn1 = function (req, res, next) { }
					, fn2 = function (req, res, next) { }
					, path = '/foo';

				router.use(path, fn1, fn2);
				expect(router.stack[0].regexp.exec(path)).to.be.ok();
				expect(router.stack[0]).to.have.property('fn', fn1);
				expect(router.stack[1].regexp.exec(path)).to.be.ok();
				expect(router.stack[1]).to.have.property('fn', fn2);
			});
		});

		describe('handle()', function () {
			it('should cylcle through added middleware', function () {
				var router = Router()
					, request = Request('/')
					, response = Response()
					, count = 0
					, fn = function (req, res, next) {
							count++;
							next();
						};

				router.use(fn, fn);
				router.handle(request, response, function (err) {
					expect(count).to.be(2);
				});
			});
			it('should always match root mounted middleware', function () {
				var router = Router()
					, request = Request('/foo')
					, response = Response()
					, count = 0
					, fn = function (req, res, next) {
							count++;
							next();
						};

				router.use(fn, fn);
				router.handle(request, response, function (err) {
					expect(count).to.be(2);
				});
			});
			it('should only trigger middleware matching the current path', function () {
				var router = Router()
					, request = Request('/foo')
					, response = Response()
					, count = 0
					, fn = function (req, res, next) {
							count++;
							next();
						};

				router.use(fn);
				router.use('/bar', fn);
				router.handle(request, response, function (err) {
					expect(count).to.be(1);
				});
			});
			it('should allow middleware to be mounted under a specific path', function () {
				var router = Router()
					, request = Request('/foo/bar')
					, response = Response()
					, count = 0
					, fn = function (req, res, next) {
							count++;
							expect(req.path).to.be('/bar');
							next();
						};

				router.use('/:bar', fn);
				router.handle(request, response, function (err) {
					expect(count).to.be(1);
					expect(request.path).to.be('/foo/bar');
				});
			});
			it('should allow middleware to handle errors', function () {
				var router = Router()
					, request = Request('/')
					, response = Response()
					, count = 0;

				router.use(function (req, res, next) {
					count++;
					next(new Error('oops'));
				});
				router.use(function (err, req, res, next) {
					count++;
					next(err);
				});
				router.use(function (req, res, next) {
					count++;
					next();
				});
				router.handle(request, response, function (err) {
					expect(count).to.be(2);
					expect(err).to.be.ok();
				});
			});
			it('should allow mounting of sub routers', function () {
				var router1 = Router()
					, router2 = Router()
					, request = Request('/foo/bar')
					, response = Response()
					, count = 0
					, fn1 = function (req, res, next) { next(); }
					, fn2 = function (req, res, next) {
							count++;
							next();
						};

				router1.use(fn1);
				router2.use('/bar', fn2);
				router2.use('/bar', fn2);
				router2.use('/bat', fn2);
				router1.use('/foo', router2);
				router1.handle(request, response, function (err) {
					expect(count).to.be(2);
				});
			});
			it('should strictly match VERB routes', function () {
				var router = Router()
					, request = Request('/foo/bar')
					, response = Response()
					, count = 0
					, fn = function (req, res, next) {
							count++;
							next();
						};

				router.use('/foo', fn);
				router.get('/foo', fn);
				router.get('/foo/bar', fn);
				router.handle(request, response, function (err) {
					expect(count).to.be(2);
				});
			});
			it('should match everything with wildcard * route', function () {
				var router = Router()
					, request = Request('/foo/bar')
					, response = Response()
					, count = 0
					, fn = function (req, res, next) {
							count++;
							next();
						};

				router.get('*', fn);
				router.handle(request, response, function (err) {
					expect(count).to.be(1);
				});
			});
		});

		describe('param()', function () {
			it('should register simple param processing', function () {
				var router = Router()
					, request = Request('/bar')
					, response = Response()
					, param = '';

				router.param('foo', function (req, res, next, foo) {
					param = foo;
					res.foo = foo;
					next();
				});
				router.use('/:foo', function (req, res, next) {
					expect(res.foo).to.be('bar');
					next();
				});
				router.handle(request, response, function (err) {
					expect(param).to.be('bar');
				});
			});
			it('should not process a param more than once', function () {
				var router = Router()
					, request = Request('/bar')
					, response = Response()
					, fn = function (req, res, next) { next(); }
					, count = 0;

				router.param('foo', function (req, res, next, foo) {
					count++;
					next();
				});
				router.use('/:foo', fn);
				router.use('/:foo', fn);
				router.handle(request, response, function (err) {
					expect(count).to.be(1);
				});
			});
		});
	});

	describe('Application', function () {
		describe('set/get', function () {
			it('should allow storage/retrieval of objects by key', function () {
				var app = express()
					, foo = {
							foo: 'bar'
						};
				app.set('foo', 'bar');
				app.set('fooObj', foo);
				expect(app.get('fooObj').foo).to.be('bar');
				expect(app.get('foo')).to.be('bar');
			});
		});

		describe('use()', function () {
			it('should register a simple middleware function', function () {
				var app = express()
					, fn = function (req, res, next) { };

				app.use(fn);
				expect(app._router.stack[0].regexp.exec('/')).to.be.ok();
				expect(app._router.stack[0]).to.have.property('fn', fn);
			});
			it('should register a simple middleware function at a specified path', function () {
				var app = express()
					, fn = function (req, res, next) { }
					, path = '/foo';

				app.use(path, fn);
				expect(app._router.stack[0].regexp.exec(path)).to.be.ok();
				expect(app._router.stack[0]).to.have.property('fn', fn);
			});
			it('should register multiple middleware functions at a specified path', function () {
				var app = express()
					, fn1 = function (req, res, next) { }
					, fn2 = function (req, res, next) { }
					, path = '/foo';

				app.use(path, fn1, fn2);
				expect(app._router.stack[0].regexp.exec(path)).to.be.ok();
				expect(app._router.stack[0]).to.have.property('fn', fn1);
				expect(app._router.stack[1].regexp.exec(path)).to.be.ok();
				expect(app._router.stack[1]).to.have.property('fn', fn2);
			});
		});

		describe('handle()', function () {
			it('should cylcle through added middleware', function () {
				var app = express()
					, request = Request('/')
					, response = Response()
					, count = 0
					, fn = function (req, res, next) {
							count++;
							next();
						};

				app.use(fn, fn);
				app.handle(request, response, function (err) {
					expect(count).to.be(2);
				});
			});
			it('should allow mounting of sub applications', function () {
				var app1 = express()
					, app2 = express()
					, request = Request('/foo/bar')
					, response = Response()
					, count = 0
					, fn1 = function (req, res, next) { next(); }
					, fn2 = function (req, res, next) {
							count++;
							next();
						};

				app1.use(fn1);
				app2.use('/bar', fn2);
				app2.use('/bar', fn2);
				app2.use('/bat', fn2);
				app1.use('/:foo', app2);
				app1.handle(request, response, function (err) {
					expect(count).to.be(2);
				});
			});
		});
	});

	describe('History', function () {
		describe('handle()', function () {
			beforeEach(function (done) {
			  historyApp = Application();
				historyApp.history.running = true;
				done();
			});
			afterEach(function (done) {
				historyApp.history.destroy();
				done();
			});
			it('should handle encoded urls', function () {
				var url = '/nb/s%C3%B8k?q=Oslo';
				historyApp.history.handle(url);
				expect(historyApp.history.current).to.eql(url);
			});
			it('should store encoded previous history in cache', function () {
				var url = '/nb/tabell/%C3%85s~1-60637';
				historyApp.history.handle(url);
				var cache = historyApp.history.cache;
				expect(cache).to.have.key(url);
				expect(cache[url].req.originalUrl).to.eql(url);
				expect(cache[url].req.path).to.eql(url);
				expect(cache[url].req.url).to.eql(url);
			});
		});
	});
});