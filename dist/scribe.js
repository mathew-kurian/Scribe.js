'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Writer = exports.Transform = exports.Router = exports.Reader = exports.Middleware = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.resolvePipeline = resolvePipeline;
exports.create = create;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rc = require('rc');

var _rc2 = _interopRequireDefault(_rc);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _middleware = require('./middleware');

var Middleware = _interopRequireWildcard(_middleware);

var _reader = require('./reader');

var Reader = _interopRequireWildcard(_reader);

var _router = require('./router');

var Router = _interopRequireWildcard(_router);

var _transform = require('./transform');

var Transform = _interopRequireWildcard(_transform);

var _writer = require('./writer');

var Writer = _interopRequireWildcard(_writer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Middleware = Middleware;
exports.Reader = Reader;
exports.Router = Router;
exports.Transform = Transform;
exports.Writer = Writer;
function resolvePipeline(scribe, pipeline) {
  var resolved = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(pipeline), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var through = _step.value;

      if (typeof through === 'function') {
        resolved.push(new through(scribe));
      } else if ((typeof through === 'undefined' ? 'undefined' : (0, _typeof3.default)(through)) === 'object') {
        resolved.push(through);
      } else if (typeof through === 'string') {
        var Class = require(_path2.default.join(__dirname, through)).default;
        resolved.push(new Class(scribe));
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return resolved;
}

var defaultOpts = _fs2.default.readFileSync(__dirname + '/../.scriberc', 'utf8');

function create(opts) {
  opts = (0, _extend2.default)(true, (0, _rc2.default)('scribe', JSON.parse(defaultOpts)), opts);

  // create default console
  var console = new Reader.BasicConsole(opts);
  var _opts = opts;
  var exposeMap = _opts.expose;
  var pipelineMap = _opts['expose/pipeline'];


  [].concat((0, _toConsumableArray3.default)(console.exposed()), (0, _toConsumableArray3.default)((0, _keys2.default)(exposeMap))).forEach(function (expose) {
    if (expose === 'default') return;
    var pipelines = exposeMap[expose] || exposeMap.default;
    if (Array.isArray(pipelines)) {
      pipelines.forEach(function (pipeline) {
        if (Array.isArray(pipelineMap[pipeline])) {
          if (opts.debug) {
            process.stdout.write('Exposing ' + expose + ' through ' + pipeline + '\n');
          }

          console.expose(expose);
          console.pipe.apply(console, [expose, pipeline].concat((0, _toConsumableArray3.default)(resolvePipeline(console, pipelineMap[pipeline]))));
        }
      });
    }
  });

  if (opts.handleUncaughtException) {
    process.on('uncaughtException', function (e) {
      return console.error(e).then(function () {
        return process.exit(1);
      });
    });
  }

  return console;
}
