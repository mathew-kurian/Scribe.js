import stack from 'callsite'
import async from 'async'

export default class {
  constructor(app = 'Scribe', id = process.pid) {
    this._transient = {};
    this._persistent = {};
    this._pipelines = {};
    this._exposed = {};

    this.persistent('app', app);
    this.persistent('id', id);
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

  exposed() {
    return Object.keys(this._exposed);
  }

  callSite(idx = 5) {
    try {
      const site = stack()[idx];

      return {
        line: site.getLineNumber(),
        file: site.getFileName(),
        func: site.getFunctionName()
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