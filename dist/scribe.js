'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transform = exports.Reader = exports.Writer = undefined;

exports.default = function () {
  var id = arguments.length <= 0 || arguments[0] === undefined ? process.pid : arguments[0];
  var opts = arguments.length <= 1 || arguments[1] === undefined ? (0, _rc2.default)('scribe', defaultOpts) : arguments[1];

  opts = (0, _assign2.default)({}, defaultOpts, opts);

  var console = new _BasicConsole2.default(opts.name, id || opts.instanceId);

  console.exposed().forEach(function (expose) {
    if (opts.mongoUri) {
      console.pipe(expose, 'mongo-socket', new _ErrorExtractor2.default(), new _MongoDB2.default(opts.mongoUri, opts.debug), opts.socketPort ? new _SocketIO2.default(opts.socketPort, opts.debug) : null);
    }

    console.pipe(expose, 'bash', new _Inspector2.default(), new _DefaultConsole2.default());
  });

  if (opts.mongoUri) {
    console.pipe('express', 'mongo-socket', new _ErrorExtractor2.default(), new _ExpressExtractor2.default(), new _MongoDB2.default(opts.mongoUri, opts.debug), opts.socketPort ? new _SocketIO2.default(opts.socketPort, opts.debug) : null);
  }

  console.pipe('express', 'bash', new _ExpressExtractor2.default(), new _ExpressInspector2.default(), new _Inspector2.default(), new _DefaultConsole2.default());

  opts.web.client.socketUris = opts.web.client.socketPorts.map(function (port) {
    return opts.publicUri + ':' + port;
  });

  console.viewer = _viewer.create.bind(null, opts.mongoUri, opts.web.router, opts.web.client, opts.debug);

  console.build = function () {

    // update
    _package2.default.main = opts.publicUri + ':' + _path2.default.join(String(opts.web.client.port), opts.basePath);

    // save
    _fs2.default.writeFileSync(__dirname + '/native/package.json', (0, _stringify2.default)(_package2.default, null, 4), { encoding: 'utf8' });

    var nw = new _nwBuilder2.default((0, _assign2.default)({
      platforms: ['win', 'osx', 'linux'],
      buildDir: __dirname + '/public/native',
      version: '0.12.3',
      zip: true
    }, opts.nwjs, { files: './native/**/**' }));

    if (opts.debug) {
      nw.on('log', function (d) {
        return console.log(d);
      });
    }

    return nw.build();
  };

  process.on('uncaughtException', function (e) {
    return console.error(e).then(function () {
      return process.exit(1);
    });
  });

  return console;
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Console = require('./readers/Console');

var _Console2 = _interopRequireDefault(_Console);

var _BasicConsole = require('./readers/BasicConsole');

var _BasicConsole2 = _interopRequireDefault(_BasicConsole);

var _Inspector = require('./transforms/Inspector');

var _Inspector2 = _interopRequireDefault(_Inspector);

var _ExpressInspector = require('./transforms/ExpressInspector');

var _ExpressInspector2 = _interopRequireDefault(_ExpressInspector);

var _ExpressExtractor = require('./transforms/ExpressExtractor');

var _ExpressExtractor2 = _interopRequireDefault(_ExpressExtractor);

var _ErrorExtractor = require('./transforms/ErrorExtractor');

var _ErrorExtractor2 = _interopRequireDefault(_ErrorExtractor);

var _MongoDB = require('./writers/MongoDB');

var _MongoDB2 = _interopRequireDefault(_MongoDB);

var _SocketIO = require('./writers/SocketIO');

var _SocketIO2 = _interopRequireDefault(_SocketIO);

var _DefaultConsole = require('./writers/DefaultConsole');

var _DefaultConsole2 = _interopRequireDefault(_DefaultConsole);

var _viewer = require('./routers/viewer');

var _nwBuilder = require('nw-builder');

var _nwBuilder2 = _interopRequireDefault(_nwBuilder);

var _rc = require('rc');

var _rc2 = _interopRequireDefault(_rc);

var _package = require('./../native/package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Writer = exports.Writer = { MongoDB: _MongoDB2.default, DefaultConsole: _DefaultConsole2.default };
var Reader = exports.Reader = { BasicConsole: _BasicConsole2.default, Console: _Console2.default };
var Transform = exports.Transform = { Inspector: _Inspector2.default, ExpressInspector: _ExpressInspector2.default, ExpressExtractor: _ExpressExtractor2.default, ErrorExtractor: _ErrorExtractor2.default };

var defaultOpts = {
  name: 'Scribe',
  mongoUri: 'mongodb://localhost/scribe',
  publicUri: 'http://localhost',
  basePath: 'scribe/',
  socketPort: 4000,
  web: {
    router: {
      username: 'build',
      password: 'build',
      authentication: true,
      sessionSecret: 'scribe-session',
      useBodyParser: true,
      useSession: true
    },
    client: {
      port: 4005,
      socketPorts: [4000],
      exposed: {
        all: { label: 'all', query: { expose: { $exists: true } } },
        error: { label: 'error', query: { expose: 'error' } },
        express: { label: 'express', query: { expose: 'express' } },
        info: { label: 'info', query: { expose: 'info' } },
        log: { label: 'log', query: { expose: 'log' } },
        warn: { label: 'warn', query: { expose: 'warn' } },
        trace: { label: 'trace', query: { expose: 'trace' } }
      }
    }
  },
  nwjs: {},
  debug: false
};

;
