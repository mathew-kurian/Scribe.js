import chalk from 'chalk'
import auth from 'basic-auth'

export default class ExpressExtractor {
  ip(req) {
    return req.ip
      || req._remoteAddress
      || req.remoteAddress
      || (req.connection && req.connection.remoteAddress)
      || req.headers['x-forwarded-for']
      || 'xx.x.x.xx';
  }

  header(res, field) {
    if (!res._header) {
      return undefined
    }

    var header = res.getHeader(field);

    return Array.isArray(header)
      ? header.join(', ')
      : header
  }

  remoteUser(req) {
    const credentials = auth(req);
    return credentials ? credentials.name : undefined;
  }

  httpVersion(req) {
    return req.httpVersionMajor + '.' + req.httpVersionMinor;
  }

  referrer(req) {
    return req.headers['referer'] || req.headers['referrer'] || req.headers['ref'];
  }

  status(res) {
    return res._header ? String(res.statusCode) : undefined;
  }

  through(data, callback) {
    var {req, res, duration} = data.args[0];

    const status = this.status(res);
    const url = req.url;
    const referrer = this.referrer(req);
    const remoteUser = this.remoteUser(req);
    const httpVersion = this.httpVersion(req);
    const ip = this.ip(req);
    const contentLength = this.header(res, 'content-length') || 0;
    const method = req.method;
    const baseUrl = req.baseUrl;
    const originalUrl = req.originalUrl;
    const params = req.originalUrl;
    const query = req.query;
    const express = {
      baseUrl, originalUrl, params, query,
      url, method, status, referrer, remoteUser, httpVersion, ip,
      duration, contentLength, headers: {
        req: req._headers,
        res: res.headers
      }
    };

    // add to default metrics object
    const metrics = data.transient.metrics || {};
    metrics.responseTime = duration;
    data.transient.metrics = metrics;

    data.args = [express];

    callback(null, data);
  }
}