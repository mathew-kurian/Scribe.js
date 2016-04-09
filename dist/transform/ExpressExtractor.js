'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _basicAuth = require('basic-auth');

var _basicAuth2 = _interopRequireDefault(_basicAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ExpressExtractor = function () {
  function ExpressExtractor() {
    (0, _classCallCheck3.default)(this, ExpressExtractor);
  }

  (0, _createClass3.default)(ExpressExtractor, [{
    key: 'ip',
    value: function ip(req) {
      return req.ip || req._remoteAddress || req.remoteAddress || req.connection && req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'xx.x.x.xx';
    }
  }, {
    key: 'header',
    value: function header(res, field) {
      if (!res._header) {
        return undefined;
      }

      var header = res.getHeader(field);

      return Array.isArray(header) ? header.join(', ') : header;
    }
  }, {
    key: 'remoteUser',
    value: function remoteUser(req) {
      var credentials = (0, _basicAuth2.default)(req);
      return credentials ? credentials.name : undefined;
    }
  }, {
    key: 'httpVersion',
    value: function httpVersion(req) {
      return req.httpVersionMajor + '.' + req.httpVersionMinor;
    }
  }, {
    key: 'referrer',
    value: function referrer(req) {
      return req.headers['referer'] || req.headers['referrer'] || req.headers['ref'];
    }
  }, {
    key: 'status',
    value: function status(res) {
      return res._header ? String(res.statusCode) : undefined;
    }
  }, {
    key: 'through',
    value: function through(data, callback) {
      var _data$args$ = data.args[0];
      var req = _data$args$.req;
      var res = _data$args$.res;
      var duration = _data$args$.duration;


      var status = this.status(res);
      var url = req.url;
      var referrer = this.referrer(req);
      var remoteUser = this.remoteUser(req);
      var httpVersion = this.httpVersion(req);
      var ip = this.ip(req);
      var contentLength = this.header(res, 'content-length') || 0;
      var method = req.method;
      var baseUrl = req.baseUrl;
      var originalUrl = req.originalUrl;
      var params = req.originalUrl;
      var query = req.query;
      var express = {
        baseUrl: baseUrl, originalUrl: originalUrl, params: params, query: query,
        url: url, method: method, status: status, referrer: referrer, remoteUser: remoteUser, httpVersion: httpVersion, ip: ip,
        duration: duration, contentLength: contentLength, headers: {
          req: req._headers,
          res: res.headers
        }
      };

      // add to default metrics object
      var metrics = data.transient.metrics || {};
      metrics.responseTime = duration;
      data.transient.metrics = metrics;

      data.args = [express];

      callback(null, data);
    }
  }]);
  return ExpressExtractor;
}();

exports.default = ExpressExtractor;
