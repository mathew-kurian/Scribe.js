'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _maxSafeInteger = require('babel-runtime/core-js/number/max-safe-integer');

var _maxSafeInteger2 = _interopRequireDefault(_maxSafeInteger);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.create = create;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _entry = require('../schemas/entry');

var _entry2 = _interopRequireDefault(_entry);

var _jade = require('jade');

var _jade2 = _interopRequireDefault(_jade);

var _basicAuth = require('basic-auth');

var _basicAuth2 = _interopRequireDefault(_basicAuth);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getObject(d, def) {
  if (typeof d === 'undefined' || d === null) {
    return def || {};
  } else if ((typeof d === 'undefined' ? 'undefined' : (0, _typeof3.default)(d)) === 'object') {
    return d;
  } else {
    try {
      return JSON.parse(d);
    } catch (e) {
      return def || {};
    }
  }
}

var viewer = _jade2.default.compileFile(__dirname + '/../../views/viewer.jade');
var login = _jade2.default.compileFile(__dirname + '/../../views/login.jade');

function create() {
  var mongoUri = arguments.length <= 0 || arguments[0] === undefined ? 'mongodb://localhost/scribe' : arguments[0];
  var routerConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var clientConfig = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var debug = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

  routerConfig = (0, _assign2.default)({
    useBodyParser: true,
    username: 'build',
    password: 'build'
  }, routerConfig);

  var conn = undefined,
      Entry = undefined;

  if (mongoUri) {
    _mongoose2.default.set('debug', debug);
    conn = _mongoose2.default.createConnection(mongoUri);
    Entry = conn.model('Entry', _entry2.default);
  }

  var router = new _express.Router();

  var authenticate = function authenticate(req, res, next) {
    function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }

    if (routerConfig.authentication === false || !routerConfig.username && !routerConfig.password) {
      return next();
    }

    var user = (0, _basicAuth2.default)(req);

    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    }

    if (user.name === routerConfig.username && user.pass === routerConfig.password) {
      return next();
    } else {
      return unauthorized(res);
    }
  };

  router.use(authenticate);
  router.use(_express2.default.static(__dirname + '/../../public'));

  if (routerConfig.useBodyParser) {
    router.use(_bodyParser2.default.json());
  }

  var renderViewer = function renderViewer(req, res) {
    return res.send(viewer({ config: (0, _stringify2.default)(clientConfig) }));
  };

  router.get('/', renderViewer);
  router.get('/viewer', renderViewer);

  router.get('/rest/:collection', function (req, res) {
    if (!mongoUri) {
      return res.json({ err: 0, docs: [] });
    }

    var collection = req.params.collection;
    var selector = getObject(req.query.selector);
    var fields = typeof req.query.fields === 'string' ? req.query.fields : '';
    var sort = getObject(req.query.sort, { _id: -1 });
    var limit = !isNaN(req.query.limit) ? Math.max(0, parseInt(Number(req.query.limit))) : _maxSafeInteger2.default;
    var col = Entry; // defaulting to Entry for now

    if (!col) {
      return res.json({ err: 1, docs: [] });
    }

    col.find(selector).select(fields).sort(sort).limit(limit).lean().exec(function () {
      var err = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
      var docs = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
      return res.json({ err: err, docs: docs });
    });
  });

  router.delete('/rest/:collection', function (req, res) {
    if (!mongoUri) {
      res.status(410);
      return res.send();
    }

    var collection = rreq.params.collection;
    var ids = req.query.id;

    try {
      ids = JSON.parse(ids);
    } catch (e) {
      // ignore
    }

    if (!Array.isArray(ids)) {
      ids = [req.param('id')];
    }

    var col = Entry; // defaulting to Entry for now

    if (col) {
      return col.remove({ _id: { $in: ids } }, function (err) {
        res.status(err ? 410 : 200);
        res.send();
      });
    }

    res.status(410);
    res.send();
  });

  return router;
}
