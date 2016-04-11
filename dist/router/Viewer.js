'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _maxSafeInteger = require('babel-runtime/core-js/number/max-safe-integer');

var _maxSafeInteger2 = _interopRequireDefault(_maxSafeInteger);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _jade = require('jade');

var _jade2 = _interopRequireDefault(_jade);

var _basicAuthConnect = require('basic-auth-connect');

var _basicAuthConnect2 = _interopRequireDefault(_basicAuthConnect);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

var _nwBuilder = require('nw-builder');

var _nwBuilder2 = _interopRequireDefault(_nwBuilder);

var _package = require('../../native/package.json');

var _package2 = _interopRequireDefault(_package);

var _url = require('url');

var _MongoDB = require('../writer/MongoDB');

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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

var Viewer = function () {
  function Viewer(scribe) {
    (0, _classCallCheck3.default)(this, Viewer);

    this.scribe = scribe;
  }

  (0, _createClass3.default)(Viewer, [{
    key: 'getRouter',
    value: function getRouter() {
      var scribe = this.scribe;
      var routerOptions = scribe.module('router/Viewer').options;
      var clientOptions = scribe.module('router/Viewer/client').options;

      var conn = void 0,
          Entry = void 0;

      _mongoose2.default.set('debug', routerOptions.debug);
      conn = _mongoose2.default.createConnection(routerOptions.mongoUri);
      Entry = conn.model('Entry', _MongoDB.EntrySchema);

      var router = new _express.Router();

      if (routerOptions.username && routerOptions.password) {
        router.use((0, _basicAuthConnect2.default)(routerOptions.username, routerOptions.password));
      }

      router.use(_express2.default.static(__dirname + '/../../public'));

      if (routerOptions.useBodyParser) {
        router.use(_bodyParser2.default.json());
      }

      var render = function render(req, res) {
        return res.send(viewer({ config: (0, _stringify2.default)(clientOptions) }));
      };

      router.get('/', render);
      router.get('/viewer', render);

      router.post('/rest/timeseries', function (req, res) {
        try {
          if (req.body && req.body.date) {
            req.body.date = req.body.date || {};

            if (req.body.date.$gt) req.body.date.$gt = new Date(req.body.date.$gt);
            if (req.body.date.$gte) req.body.date.$gte = new Date(req.body.date.$gte);
            if (req.body.date.$eq) req.body.date.$eq = new Date(req.body.date.$eq);
            if (req.body.date.$lt) req.body.date.$lt = new Date(req.body.date.$lt);
            if (req.body.date.$lte) req.body.date.$lte = new Date(req.body.date.$lte);
            if (req.body._id && Array.isArray(req.body._id.$in)) req.body._id.$in = req.body._id.$in.map(function (a) {
              return _mongoose2.default.Types.ObjectId(a);
            });
            if (req.body._id && typeof req.body._id === 'string') req.body._id = _mongoose2.default.Types.ObjectId(req.body._id);
          }
        } catch (e) {
          // ignore
        }

        Entry.aggregate([{ $match: req.body }, {
          $project: {
            hour: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              day: { $dayOfMonth: '$date' },
              hour: { $hour: '$date' }
            },
            expose: '$expose'
          }
        }, {
          $group: {
            _id: { hour: '$hour', expose: '$expose' },
            number: { $sum: 1 }
          }
        }], function (err, out) {
          return res.json(out || []);
        });
      });

      router.get('/rest/db/:collection', function (req, res) {
        var _Entry$find;

        if (!routerOptions.mongoUri) {
          return res.json({ err: 0, docs: [] });
        }

        var selector = getObject(req.query.selector);
        var fields = typeof req.query.fields === 'string' ? req.query.fields : '';
        var sort = getObject(req.query.sort, { _id: -1 });
        var limit = !isNaN(req.query.limit) ? Math.max(0, parseInt(req.query.limit)) : _maxSafeInteger2.default;
        var skip = !isNaN(req.query.skip) ? Math.max(0, parseInt(req.query.skip)) : 0;

        res.type('application/json');

        var stream = (_Entry$find = Entry.find(selector)).select.apply(_Entry$find, (0, _toConsumableArray3.default)(fields.split(' '))).skip(skip).limit(limit).sort(sort).stream();

        stream.pipe(_JSONStream2.default.stringify()).pipe(res);
      });

      router.delete('/rest/db/:collection', function (req, res) {
        if (!routerOptions.mongoUri) {
          res.status(410);
          return res.send();
        }

        var ids = req.query.id;

        try {
          ids = JSON.parse(ids);
        } catch (e) {
          // ignore
        }

        if (!Array.isArray(ids)) {
          ids = [req.param('id')];
        }

        Entry.remove({ _id: { $in: ids } }, function (err) {
          res.status(err ? 410 : 200);
          res.send();
        });
      });

      if (routerOptions.native) {}

      return router;
    }
  }, {
    key: 'getNative',
    value: function getNative() {
      var scribe = this.scribe;
      var nativeOptions = scribe.module('router/Viewer/native').options;

      // update
      _package2.default.main = (0, _url.format)(nativeOptions);

      // save
      _fs2.default.writeFileSync(__dirname + '/../../native/package.json', (0, _stringify2.default)(_package2.default, null, 4), { encoding: 'utf8' });

      var nw = new _nwBuilder2.default((0, _extend2.default)(true, {
        platforms: ['win', 'osx', 'linux'],
        buildDir: __dirname + '/../../public/native',
        version: '0.12.3',
        zip: true
      }, nativeOptions, { files: __dirname + '/../../native/**/**' }));

      if (nativeOptions.debug) {
        nw.on('log', function (d) {
          return console.log(d);
        });
      }

      return nw.build();
    }
  }]);
  return Viewer;
}();

exports.default = Viewer;
