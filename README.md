An [express.js](http://expressjs.com) framework for browser clients that leverages the browser History API. Enables a subset of express.js functionality for use in browser environments, including middleware, routing, mounting, and request/response.

## Usage
```js
var express = require('express-client')
  , app = express();

// Handle root path
app.get('/', function (req, res, next) {
  res.render('home');
});

// Start litening for history API events
app.listen();
```

## API

### express-client
Factory method for creating `Application` instances.

```js
var express = require('express-client')
  , app = express();
```

### Application
- **locals `Object`**: global object for defining properties to be made available to views called during `response.render()`

#### use([path], ...callbacks([err,] req, res, next))
Register one or more middleware handlers at optional route `path`. Path matching and `param` parsing syntax is the same as for express.js (via [path-to-regex](https://github.com/pillarjs/path-to-regexp)). Function handler syntax follows the standard Connect middleware pattern, including 4 argument `error` middleware. Also supports mounting of express-client subapplications.
```js
var app = express()
  , searchapp = express();

// Handle unhandled requests
app.use(function unhandledMiddleware (err, req, res, next) {
  var status = err.statusCode || err.code
    , msg = err.message || err.msg;

  if (err && status != 404) return console.log(err.stack);
  res.redirect(req.originalUrl);
});

// Mount 'searchapp' at '/en/search' or '/nb/søk'
app.use('/:localeCode/:page(search|søk)', searchapp);
```

#### param(name, callback(req, res, next, value))
Map logic to route parameters, enabling validation and async middleware operations.
```js
app.param('localeCode', function (req, res, next, code) {
  // Do not handle other locales directly
  if (code == config.defaultLocaleCode) {
    res.localeCode = code;
    next();
  } else {
    // 404 wrong locale
    var err = new Error('invalid locale code: ' + code);
    err.statusCode = 404;
    next(err);
  }
});
```

#### set(key, value)
Assign `value` to `key`.
```js
app.set('config', {api: '/api'});
app.get('config').api; //=> '/api'

app.set('view', function (name, options) {
  this.path = name;
  this.render = function renderer (locals, callback) {
    // render view with 'locals'
  };
});
```

#### get(key)
Retrieve value for `key`.
```js
app.get('env'); //=> 'development'
```

#### METHOD(path, ...callbacks(req, res, next))
*NOTE: in contrast to server-side express, the client makes no distinction between method verbs (get, post, etc)*. Routing functionality where, unlike regulare middleware, all *verb* middleware `path`'s are strictly matched. In addition, query parameters are always ignored when matching
```js
// Will not match '/blog/article123'
app.get('/blog', function (req, res, next) {
  // Handle...
});
// Will match all
app.get('*', function (req, res, next) {
  // Handle...
});
```

#### listen()
Begin listening for url changes via the browser History API. If the API is not supported, the initial bootstrap request will be routed as normal, but subsequent calls to `app.navigateTo` will be sent directly to the server. In addition, when mounting sub-applications, calls to `subapp.listen()` will be ignored.
```js
app.listen();
```

#### navigateTo(url, title)
Change the current browser history state by navigating to `url`. Will trigger a new *request/response* cycle through the middleware pipeline. If the History API is not supported, will send request directly to the server.
```js
app.navigateTo('/search?q=oslo');
```

#### redirectTo(url, title)
Unlike `navigateTo`, will not attempt to handle the request, and will instead send request directly to the server.
```js
app.redirectTo('/help');
```

#### getCurrentContext()
Retrieve the current *request/response* context.
```js
var ctx = app.getCurrentContext()
  , res = ctx.res
  , req = ctx.req;
```

### Request
- **url|originalUrl `String`**: the full url, including querystring. Not modified, even for mounted sub-applications
- **path `String`**: non-querystring portion of url. Modified (trimmed) for mounted sub-applications:
```js
var app = express()
  , blogapp = express();

app.use('/blog', blogapp);

blogapp.get('/', function (req, res, next) {
  console.log(req.originalUrl, req.path); //=> '/blog', '/'
});
```
- **search `String`**: the querystring portion of the url, including '?'
- **querystring `String`**: the querystring portion of the url, excluding '?'
- **query `Object`**: the parsed querystring object
- **cached `Boolean`**: flag indicating that this request has been pulled from cache (after navigating forewards/backwards in history)
- **app** `Application`: reference to the current `Application` instance. Will reference the *local* instance when mounting sub-applications:
```js
app.use(function (req, res, next) {
  console.log(req.app === app); //=> true
  next();
});

blogapp.get('/', function (req, res, next) {
  console.log(req.app === app); //=> false
  console.log(req.app === blogapp); //=> true
  });
```

### Response
- **locals `Object`**: object for defining properties to be made available to views called during `render()`
- **statusCode `Number`**: retrieve status code for response. Status codes are generally ignored, with the exception of handled requests `200`, unhandled requests `404`, and aborted requests `499`
- **cached `Boolean`**: flag indicating that this request has been pulled from cache (after navigating forewards/backwards in history)
- **app `Application`**: reference to the current `Application` instance. Will reference the *local* instance when mounting sub-applications (see above)
- **req `Request`**: reference to the corresponding `Request` instance

#### status(code)
Set the status `code` retrievable via `res.statusCode`

#### send()
Complete response (last method called in pipeline). Emits a `finish` event.
```js
app.use(function (req, res, next) {
  res.on('finish', cleanUp);
  next();
});
```

#### abort()
Abort response. Emits a `close` event.

#### redirect(url)
See `application.redirect(url)`

#### render(view [options], [callback(err)])
Complete response by rendering `view` with (optional) `options` data:
```js
app.set('view', function (name, options) {
  this.path = name;
  this.render = function renderer (locals, callback) {
    if (name == 'home') React.render(homeComponent(locals), elHome);
  };
});
app.get('/', function (req, res, next) {
  res.render('home', {title: 'home'});
});
```