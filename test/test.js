'use strict';

var Application = require('src/lib/application');
var expect = window.expect;
var express = require('src/index');
var Request = require('src/lib/request');
var Response = require('src/lib/response');
var Router = require('src/lib/router');

describe('express-client', function() {
  describe('application factory', function() {
    it('should store the app instance on the Request/Response instance', function() {
      var app = express();
      var req = app.history.request();

      expect(req.app).to.be(app);
    });
  });

  describe('Router', function() {
    describe('use()', function() {
      it('should register a simple middleware function', function() {
        var router = Router();
        var fn = function(req, res, next) {};

        router.use(fn);
        expect(router.stack[0]).to.have.property('fn', fn);
      });
      it('should register a simple middleware function at a specified path', function() {
        var router = Router();
        var fn = function(req, res, next) {};
        var path = '/foo';

        router.use(path, fn);
        expect(router.stack[0]).to.have.property('fn', fn);
        expect(router.stack[0].regexp.exec(path)).to.be.ok();
      });
      it('should register multiple middleware functions at a specified path', function() {
        var router = Router();
        var fn1 = function(req, res, next) {};
        var fn2 = function(req, res, next) {};
        var path = '/foo';

        router.use(path, fn1, fn2);
        expect(router.stack[0].regexp.exec(path)).to.be.ok();
        expect(router.stack[0]).to.have.property('fn', fn1);
        expect(router.stack[1].regexp.exec(path)).to.be.ok();
        expect(router.stack[1]).to.have.property('fn', fn2);
      });
    });

    describe('handle()', function() {
      it('should cylcle through added middleware', function() {
        var router = Router();
        var request = Request('/');
        var response = Response();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use(fn, fn);
        router.handle(request, response, function(err) {
          expect(count).to.be(2);
        });
      });
      it('should always match root mounted middleware', function() {
        var router = Router();
        var request = Request('/foo');
        var response = Response();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use(fn, fn);
        router.handle(request, response, function(err) {
          expect(count).to.be(2);
        });
      });
      it('should only trigger middleware matching the current path', function() {
        var router = Router();
        var request = Request('/foo');
        var response = Response();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use(fn);
        router.use('/bar', fn);
        router.handle(request, response, function(err) {
          expect(count).to.be(1);
        });
      });
      it('should allow middleware to be mounted under a specific path', function() {
        var router = Router();
        var request = Request('/foo/bar');
        var response = Response();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          expect(req.path).to.be('/bar');
          next();
        };

        router.use('/:bar', fn);
        router.handle(request, response, function(err) {
          expect(count).to.be(1);
          expect(request.path).to.be('/foo/bar');
        });
      });
      it('should allow middleware to handle errors', function() {
        var router = Router();
        var request = Request('/');
        var response = Response();
        var count = 0;

        router.use(function(req, res, next) {
          count++;
          next(new Error('oops'));
        });
        router.use(function(err, req, res, next) {
          count++;
          next(err);
        });
        router.use(function(req, res, next) {
          count++;
          next();
        });
        router.handle(request, response, function(err) {
          expect(count).to.be(2);
          expect(err).to.be.ok();
        });
      });
      it('should allow mounting of sub routers', function() {
        var router1 = Router();
        var router2 = Router();
        var request = Request('/foo/bar');
        var response = Response();
        var count = 0;
        var fn1 = function(req, res, next) {
          next();
        };
        var fn2 = function(req, res, next) {
          count++;
          next();
        };

        router1.use(fn1);
        router2.use('/bar', fn2);
        router2.use('/bar', fn2);
        router2.use('/bat', fn2);
        router1.use('/foo', router2);
        router1.handle(request, response, function(err) {
          expect(count).to.be(2);
        });
      });
      it('should strictly match VERB routes', function() {
        var router = Router();
        var request = Request('/foo/bar');
        var response = Response();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use('/foo', fn);
        router.get('/foo', fn);
        router.get('/foo/bar', fn);
        router.handle(request, response, function(err) {
          expect(count).to.be(2);
        });
      });
      it('should match everything with wildcard * route', function() {
        var router = Router();
        var request = Request('/foo/bar');
        var response = Response();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.get('*', fn);
        router.handle(request, response, function(err) {
          expect(count).to.be(1);
        });
      });
    });

    describe('param()', function() {
      it('should register simple param processing', function() {
        var router = Router();
        var request = Request('/bar');
        var response = Response();
        var param = '';

        router.param('foo', function(req, res, next, foo) {
          param = foo;
          res.foo = foo;
          next();
        });
        router.use('/:foo', function(req, res, next) {
          expect(res.foo).to.be('bar');
          next();
        });
        router.handle(request, response, function(err) {
          expect(param).to.be('bar');
        });
      });
      it('should not process a param more than once', function() {
        var router = Router();
        var request = Request('/bar');
        var response = Response();
        var fn = function(req, res, next) {
          next();
        };
        var count = 0;

        router.param('foo', function(req, res, next, foo) {
          count++;
          next();
        });
        router.use('/:foo', fn);
        router.use('/:foo', fn);
        router.handle(request, response, function(err) {
          expect(count).to.be(1);
        });
      });
      it('should handle error in param processing', function() {
        var router = Router();
        var request = Request('/bar');
        var response = Response();

        router.param('foo', function(req, res, next, foo) {
          next(new Error('foo'));
        });
        router.handle(request, response, function(err) {
          expect(err).to.exist;
        });
      });
    });
  });

  describe('Application', function() {
    describe('set/get', function() {
      it('should allow storage/retrieval of objects by key', function() {
        var app = express();
        var foo = {
          foo: 'bar'
        };

        app.set('foo', 'bar');
        app.set('fooObj', foo);
        expect(app.get('fooObj').foo).to.be('bar');
        expect(app.get('foo')).to.be('bar');
      });
    });

    describe('use()', function() {
      it('should register a simple middleware function', function() {
        var app = express();
        var fn = function(req, res, next) {};

        app.use(fn);
        expect(app._router.stack[0].regexp.exec('/')).to.be.ok();
        expect(app._router.stack[0]).to.have.property('fn', fn);
      });
      it('should register a simple middleware function at a specified path', function() {
        var app = express();
        var fn = function(req, res, next) {};
        var path = '/foo';

        app.use(path, fn);
        expect(app._router.stack[0].regexp.exec(path)).to.be.ok();
        expect(app._router.stack[0]).to.have.property('fn', fn);
      });
      it('should register multiple middleware functions at a specified path', function() {
        var app = express();
        var fn1 = function(req, res, next) {};
        var fn2 = function(req, res, next) {};
        var path = '/foo';

        app.use(path, fn1, fn2);
        expect(app._router.stack[0].regexp.exec(path)).to.be.ok();
        expect(app._router.stack[0]).to.have.property('fn', fn1);
        expect(app._router.stack[1].regexp.exec(path)).to.be.ok();
        expect(app._router.stack[1]).to.have.property('fn', fn2);
      });
    });

    describe('handle()', function() {
      it('should cylcle through added middleware', function() {
        var app = express();
        var request = Request('/');
        var response = Response();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        app.use(fn, fn);
        app.handle(request, response, function(err) {
          expect(count).to.be(2);
        });
      });
      it('should allow mounting of sub applications', function() {
        var app1 = express();
        var app2 = express();
        var request = Request('/foo/bar');
        var response = Response();
        var count = 0;
        var fn1 = function(req, res, next) {
          next();
        };
        var fn2 = function(req, res, next) {
          count++;
          next();
        };

        app1.use(fn1);
        app2.use('/bar', fn2);
        app2.use('/bar', fn2);
        app2.use('/bat', fn2);
        app1.use('/:foo', app2);
        app1.handle(request, response, function(err) {
          expect(count).to.be(2);
        });
      });
    });
    describe('reload()', function() {
      beforeEach(function(done) {
        this.app = express();
        this.app.history.running = true;
        this.app.cache['dummy'] = {
          render: function(view, opt, fn) {}
        };
        this.app.listen();
        done();
      });

      it('should reload app using current context', function() {
        this.app.handle(Request('/url'), Response());
        var oldCtx = this.app.getCurrentContext();

        this.app.reload();
        var newCtx = this.app.getCurrentContext();

        expect(oldCtx).to.be.equal(newCtx);
      });
      it.skip('should reload app and reset request state', function() {
        var request = Request('/bar');
        var response = Response();
        var count = 0;

        this.app.param('foo', function(req, res, next, foo) {
          res.foo = foo;
          next();
        });
        var self = this;

        this.app.use('/:foo', function(req, res, next) {
          count++;
          res.app = self.app;
          res.req = req;
          res.send();
          next();
        });

        this.app.handle(request, response);
        this.app.reload();

        expect(response.statusCode).to.be(200);
        expect(response.req.params).to.eql(null);
        expect(count).to.be(2);
      });
    });
  });

  describe('History', function() {
    describe('handle()', function() {
      var historyApp;

      beforeEach(function(done) {
        historyApp = Application();
        historyApp.history.running = true;
        done();
      });
      afterEach(function(done) {
        historyApp.history.destroy();
        done();
      });

      it('should handle encoded urls', function() {
        var url = '/nb/s%C3%B8k?q=Oslo';

        historyApp.history.handle(url);
        expect(historyApp.history.current).to.eql(url);
      });
      it('should store encoded previous history in cache', function() {
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

  describe('Response', function() {
    describe.skip('cookie()', function() {
      it('should set single cookie', function() {
        var response = Response();

        response.cookie('foo', 'bar');
        expect(document.cookie).to.eql('foo=bar');
      });
      it('should set multiple cookies', function() {
        var response = Response();

        response.cookie('foo', 'bar', { maxAge: 1000 });
        response.cookie('boo', 'bat');
        expect(document.cookie).to.eql('foo=bar; boo=bat');
      });
    });
  });

  describe('Request', function() {
    describe.skip('cookies()', function() {
      beforeEach(function() {
        document.cookie = 'foo=bar;boo=bat';
      });

      it('should get cookies', function() {
        var request = Request();

        expect(request.cookies).to.have.property('foo', 'bar');
        expect(request.cookies).to.have.property('boo', 'bat');
      });
    });

    describe('parse', function() {
      it('should parse query params', function() {
        var request = Request('http://www.yr.no/en/search?q=foo');

        expect(request.query).to.eql({ q: 'foo' });
        expect(request.querystring).to.eql('q=foo');
        expect(request.search).to.eql('?q=foo');
      });
      it('should parse simple hash fragments', function() {
        var request = Request('http://www.yr.no/en#page');

        expect(request.hash).to.eql({ page: null });
      });
      it('should parse complex hash fragments', function() {
        var request = Request('http://www.yr.no/en#fav=123,456&visit=789');

        expect(request.hash).to.eql({ fav: '123,456', visit: '789' });
      });
      it('should parse both query params and hash fragments', function() {
        var request = Request('http://www.yr.no/en/search?q=foo#fav=123,456&visit=789');

        expect(request.query).to.eql({ q: 'foo' });
        expect(request.hash).to.eql({ fav: '123,456', visit: '789' });
        expect(request.url).to.eql('http://www.yr.no/en/search?q=foo');
      });
    });
  });
});
