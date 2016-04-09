import Console from './Console'
import stack from 'callsite'
import time from '../libs/time';

export default class extends Console {
  constructor(app, id) {
    super(app, id);

    this._times = new Map();

    // open loggers

    this.expose('trace');
    this.expose('log');
    this.expose('warn');
    this.expose('error');
    this.expose('info');
    this.expose('timing');
  }

  date() {
    this.transient('date', new Date());
  }

  time(label) {
    this._times.set(label, time());

    return this;
  }

  tag(...tags) {
    this.transient('tags', tags);

    return this;
  }

  metric(...metrics) {
    let map = {};
    for (var i = 1; i < metrics.length; i += 2) {
      map[metrics[i - 1]] = metrics[i];
    }

    this.transient('metrics', Object.assign(this.transient('metrics') || {}, map));

    return this;
  }

  trace(text) {
    this.transient('callsite', this.callSite(2));
    return this.out('trace', new Error(text));
  }

  timeEnd(label) {
    var start = this._times.get(label);
    if (!start) {
      throw new Error(`No such label: ${label}`);
    }

    this.captureStackTrace();

    this._times.delete(label);

    const duration = time() - start;

    return this.metric(label, duration).timing('');
  }
}