'use strict';

var expect = require('chai/chai.js').expect;
var express = require('../../index');
var requestFactory = require('../../lib/request');
var responseFactory = require('../../lib/response');
var routerFactory = require('../../lib/router');

describe('express-client', function() {
  describe('application factory', function() {
    it('should store the app instance on the request/response instance', function() {
      var app = express();
      var req = app.history.request();

      expect(req.app).to.equal(app);
    });
  });

  describe('router', function() {
    describe('use()', function() {
      it('should register a simple middleware function', function() {
        var router = routerFactory();
        var fn = function(req, res, next) {};

        router.use(fn);
        expect(router.stack[0]).to.have.property('fn', fn);
      });
      it('should register a simple middleware function at a specified path', function() {
        var router = routerFactory();
        var fn = function(req, res, next) {};
        var path = '/foo';

        router.use(path, fn);
        expect(router.stack[0]).to.have.property('fn', fn);
        expect(router.stack[0].regexp.exec(path)).to.exist;
      });
      it('should register multiple middleware functions at a specified path', function() {
        var router = routerFactory();
        var fn1 = function(req, res, next) {};
        var fn2 = function(req, res, next) {};
        var path = '/foo';

        router.use(path, fn1, fn2);
        expect(router.stack[0].regexp.exec(path)).to.exist;
        expect(router.stack[0]).to.have.property('fn', fn1);
        expect(router.stack[1].regexp.exec(path)).to.exist;
        expect(router.stack[1]).to.have.property('fn', fn2);
      });
    });

    describe('handle()', function() {
      it('should cycle through added middleware', function() {
        var router = routerFactory();
        var request = requestFactory('/');
        var response = responseFactory();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use(fn, fn);
        router.handle(request, response, function(err) {
          expect(count).to.equal(2);
        });
      });
      it('should always match root mounted middleware', function() {
        var router = routerFactory();
        var request = requestFactory('/foo');
        var response = responseFactory();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use(fn, fn);
        router.handle(request, response, function(err) {
          expect(count).to.equal(2);
        });
      });
      it('should only trigger middleware matching the current path', function() {
        var router = routerFactory();
        var request = requestFactory('/foo');
        var response = responseFactory();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use(fn);
        router.use('/bar', fn);
        router.handle(request, response, function(err) {
          expect(count).to.equal(1);
        });
      });
      it('should allow middleware to be mounted under a specific path', function() {
        var router = routerFactory();
        var request = requestFactory('/foo/bar');
        var response = responseFactory();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          expect(req.path).to.equal('/bar');
          next();
        };

        router.use('/:bar', fn);
        router.handle(request, response, function(err) {
          expect(count).to.equal(1);
          expect(request.path).to.equal('/foo/bar');
        });
      });
      it('should allow middleware to handle errors', function() {
        var router = routerFactory();
        var request = requestFactory('/');
        var response = responseFactory();
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
          expect(count).to.equal(2);
          expect(err).to.exist;
        });
      });
      it('should strictly match VERB routes', function() {
        var router = routerFactory();
        var request = requestFactory('/foo/bar');
        var response = responseFactory();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.use('/foo', fn);
        router.get('/foo', fn);
        router.get('/foo/bar', fn);
        router.handle(request, response, function(err) {
          expect(count).to.equal(2);
        });
      });
      it('should match everything with wildcard * route', function() {
        var router = routerFactory();
        var request = requestFactory('/foo/bar');
        var response = responseFactory();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        router.get('*', fn);
        router.handle(request, response, function(err) {
          expect(count).to.equal(1);
        });
      });
    });

    describe('param()', function() {
      it('should register simple param processing', function() {
        var router = routerFactory();
        var request = requestFactory('/bar');
        var response = responseFactory();
        var param = '';

        router.param('foo', function(req, res, next, foo) {
          param = foo;
          res.foo = foo;
          next();
        });
        router.use('/:foo', function(req, res, next) {
          expect(res.foo).to.equal('bar');
          next();
        });
        router.handle(request, response, function(err) {
          expect(param).to.equal('bar');
        });
      });
      it('should not process a param more than once', function() {
        var router = routerFactory();
        var request = requestFactory('/bar');
        var response = responseFactory();
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
          expect(count).to.equal(1);
        });
      });
      it('should handle error in param processing', function() {
        var router = routerFactory();
        var request = requestFactory('/bar');
        var response = responseFactory();

        router.param('foo', function(req, res, next, foo) {
          next(new Error('foo'));
        });
        router.use('/:foo', function(req, res, next) {});
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
        expect(app.get('fooObj').foo).to.equal('bar');
        expect(app.get('foo')).to.equal('bar');
      });
    });

    describe('use()', function() {
      it('should register a simple middleware function', function() {
        var app = express();
        var fn = function(req, res, next) {};

        app.use(fn);
        expect(app._router.stack[0].regexp.exec('/')).to.exist;
        expect(app._router.stack[0]).to.have.property('fn', fn);
      });
      it('should register a simple middleware function at a specified path', function() {
        var app = express();
        var fn = function(req, res, next) {};
        var path = '/foo';

        app.use(path, fn);
        expect(app._router.stack[0].regexp.exec(path)).to.exist;
        expect(app._router.stack[0]).to.have.property('fn', fn);
      });
      it('should register multiple middleware functions at a specified path', function() {
        var app = express();
        var fn1 = function(req, res, next) {};
        var fn2 = function(req, res, next) {};
        var path = '/foo';

        app.use(path, fn1, fn2);
        expect(app._router.stack[0].regexp.exec(path)).to.exist;
        expect(app._router.stack[0]).to.have.property('fn', fn1);
        expect(app._router.stack[1].regexp.exec(path)).to.exist;
        expect(app._router.stack[1]).to.have.property('fn', fn2);
      });
    });

    describe('handle()', function() {
      it('should cycle through added middleware', function() {
        var app = express();
        var request = requestFactory('/');
        var response = responseFactory();
        var count = 0;
        var fn = function(req, res, next) {
          count++;
          next();
        };

        app.use(fn, fn);
        app.handle('handle', request, response, function(err) {
          expect(count).to.equal(2);
        });
      });
      it('should allow for optional render action', function() {
        var app = express();
        var request = requestFactory('/foo');
        var response = responseFactory();
        var count = 0;
        var rendered = false;
        var handled = false;
        var fn1 = function(req, res, next) {
          count++;
          next();
        };
        var fn2 = function(req, res, next) {
          handled = true;
        };
        app.render = function(req, res) {
          rendered = true;
        };

        app.use(fn1, fn1);
        app.use('/foo', fn2);
        app.handle('render', request, response, function(err) {
          expect(count).to.equal(2);
          expect(rendered).to.equal(true);
          expect(handled).to.equal(false);
        });
      });
      it('should allow for optional rerender action', function() {
        var app = express();
        var request = requestFactory('/foo');
        var response = responseFactory();
        var count = 0;
        var rerendered = false;
        var handled = false;
        var fn1 = function(req, res, next) {
          count++;
          next();
        };
        var fn2 = function(req, res, next) {
          handled = true;
        };
        app.rerender = function(req, res) {
          rerendered = true;
        };

        app.use(fn1, fn1);
        app.use('/foo', fn2);
        app.handle('rerender', request, response, function(err) {
          expect(count).to.equal(2);
          expect(rerendered).to.equal(true);
          expect(handled).to.equal(false);
        });
      });
      it('should notify on external link', function() {
        var app = express();
        var count = 0;
        app.on('link:external', function(url, data) {
          count++;
          expect(url).to.equal('/');
        });

        app.handle('external', '/', {}, function(err) {
          expect(count).to.equal(1);
        });
      });
    });
    describe('reload()', function() {
      beforeEach(function(done) {
        this.app = express();
        this.app.history.running = true;
        this.app.listen();
        done();
      });

      it('should reload app using current context', function() {
        this.app.handle('handle', requestFactory('/url'), responseFactory());
        var oldCtx = this.app.getCurrentContext();

        this.app.reload();
        var newCtx = this.app.getCurrentContext();

        expect(oldCtx).to.be.equal(newCtx);
      });
      it('should reload app and reset request state', function() {
        var request = requestFactory('/bar');
        var response = responseFactory();
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

        this.app.handle('handle', request, response);
        this.app.reload();

        expect(response.statusCode).to.equal(200);
        expect(response.req.params).to.eql(null);
        expect(count).to.equal(2);
      });
    });
  });

  describe('History', function() {
    describe('handle()', function() {
      var historyApp;

      beforeEach(function(done) {
        historyApp = express();
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

  describe('response', function() {
    describe.skip('cookie()', function() {
      it('should set single cookie', function() {
        var response = responseFactory();

        response.cookie('foo', 'bar');
        expect(document.cookie).to.eql('foo=bar');
      });
      it('should set multiple cookies', function() {
        var response = responseFactory();

        response.cookie('foo', 'bar', { maxAge: 1000 });
        response.cookie('boo', 'bat');
        expect(document.cookie).to.eql('foo=bar; boo=bat');
      });
    });
  });

  describe('request', function() {
    describe.skip('cookies()', function() {
      beforeEach(function() {
        document.cookie = 'foo=bar;boo=bat';
      });

      it('should get cookies', function() {
        var request = requestFactory();

        expect(request.cookies).to.have.property('foo', 'bar');
        expect(request.cookies).to.have.property('boo', 'bat');
      });
    });

    describe('parse', function() {
      it('should parse query params', function() {
        var request = requestFactory('http://www.yr.no/en/search?q=foo');

        expect(request.query).to.eql({ q: 'foo' });
        expect(request.querystring).to.eql('q=foo');
        expect(request.search).to.eql('?q=foo');
      });
      it('should parse simple hash fragments', function() {
        var request = requestFactory('http://www.yr.no/en#page');

        expect(request.hash).to.eql({ page: null });
      });
      it('should parse complex hash fragments', function() {
        var request = requestFactory('http://www.yr.no/en#fav=123,456&visit=789');

        expect(request.hash).to.eql({ fav: '123,456', visit: '789' });
      });
      it('should parse both query params and hash fragments', function() {
        var request = requestFactory('http://www.yr.no/en/search?q=foo#fav=123,456&visit=789');

        expect(request.query).to.eql({ q: 'foo' });
        expect(request.hash).to.eql({ fav: '123,456', visit: '789' });
        expect(request.url).to.eql('http://www.yr.no/en/search?q=foo');
      });
    });
  });
});
