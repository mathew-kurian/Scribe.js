import stack from 'callsite'
import async from 'async'

export default class {
  constructor(config) {
    this._transient = {};
    this._persistent = {};
    this._pipelines = {};
    this._exposed = {};
    this._config = config;

    this.persistent('app', this._config.app);
    this.persistent('id', this._config.id);
  }

  module(namespace) {
    if (namespace) {
      const options = this._config.module[namespace] || {};

      options.isSet = () => Object.keys(options).length;

      return {options};
    }

    return this._config;
  }

  transient(key, value) {
    if (arguments.length === 1) {
      return this._transient[key];
    }

    this._transient[key] = value;
    return this;
  }

  persistent(key, value) {
    if (arguments.length === 1) {
      return this._persistent[key];
    }

    this._persistent[key] = value;
    return this;
  }

  exposed(expose) {
    if (expose) {
      return !!this._exposed[expose];
    }

    return Object.keys(this._exposed);
  }

  captureStackTrace(idx = 3) {
    if (!this.transient('callsite')) {
      return this.transient('callsite', this.callSite(idx));
    }
  }

  callSite(idx = 3) {
    try {
      const site = stack()[idx];

      return {
        line: site.getLineNumber(),
        file: site.getFileName(),
        func: site.getFunctionName() || 'anonymous'
      };

      return site;
    } catch (e) {
      return {line: 0, file: '-', func: '-'};
    }
  }

  preout() {
    // ignore
  }

  out(expose, ...args) {
    this.captureStackTrace();

    return new Promise((resolve, reject)=> {
      if (!this._pipelines[expose]) {
        return resolve();
      }

      this.preout();

      const pipelines = this._pipelines[expose];
      const transient = this._transient;
      const persistent = this._persistent;
      const errs = [];
      const now = new Date();

      if (!transient.date) {
        transient.date = now;
      }

      if (!transient.callsite) {
        transient.callsite = this.callSite();
      }

      if (!args.length) {
        args = [''];
      }

      // reset before async
      this.reset();

      async.forEachOfSeries(pipelines, (pipeline, name, callback) => {
        let input = {
          expose, args, persistent, date: now,
          transient: Object.assign({}, transient)
        };

        async.eachSeries(pipeline, (through, callback)=> {
          if (!through) {
            return callback();
          }

          through.through(input, (err, output) => {
            if (err) errs.push(err);
            input = output || input;
            callback(err);
          });
        }, () => callback());
      }, ()=> {
        if (errs.length) {
          return reject(errs);
        }

        resolve();
      });
    });
  }

  expose(expose) {
    if (typeof this[expose] !== 'function') {
      this[expose] = this.out.bind(this, expose);
    }

    this._exposed[expose] = true;

    return this;
  }

  pipe(expose, name, ...throughs) {
    this.expose(expose);

    if (throughs.length) {
      let t = this._pipelines[expose] || {};
      if (t[name]) {
        throw new Error(`Pipeline ${name} for ${expose} is already taken`);
      }

      t[name] = throughs;
      this._pipelines[expose] = t;
    } else {
      return this._pipelines[expose][name];
    }

    return this;
  }

  reset() {
    this._transient = {};
    return this;
  }

  override() {
    global._console = console;

    delete global.console;

    Object.defineProperty(global, 'console', {
      enumerable: true,
      configurable: true,
      writable: false,
      value: this
    });

    return this;
  }
}
