import Console from './Console'
import stack from 'callsite'
import onFinish from 'on-finished'

function time() {
  if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
    const duration = process.hrtime();
    return duration[0] * 1000 + duration[1] / 1e6;
  }

  return Date.now();
}

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

  middleware(expose = 'express', ignore = [/(scribe)/g]) {
    this.expose(expose);

    ignore = Array.isArray(ignore) ? ignore : [ignore];

    return (req, res, next) => {
      let start = time();
      onFinish(res, () => {
        const {originalUrl} = req;
        for (const k of ignore) {
          if (new RegExp(k).test(originalUrl)) return;
        }

        this[expose]({req, res, duration: (time() - start)});
      });
      next();
    }
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
    this.transient('callsite', this.callSite(4));
    return this.out('trace', new Error(text));
  }

  timeEnd(label) {
    var start = this._times.get(label);
    if (!start) {
      throw new Error(`No such label: ${label}`);
    }

    this._times.delete(label);

    this.transient('callsite', this.callSite(5));

    const duration = time() - start;

    return this.metric(label, duration).timing('');
  }
}