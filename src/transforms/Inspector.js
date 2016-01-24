import _ from 'underscore'
import chalk from 'chalk'
import inspect from '../libs/inspect'

export default class Inspector {
  constructor(inspectOpts = {colors: true, showHidden: false, depth: 5}) {
    this.inspectOpts = inspectOpts;
  }

  format(f, ...args) {
    const ctx = this.inspectOpts;

    if (typeof f !== 'string') {
      var objects = [];
      for (const arg of [f].concat(args)) {
        objects.push(inspect(arg, ctx));
      }

      return objects.join(' ');
    }

    if (!args.length) {
      return f;
    }

    var i = 0;
    var len = args.length;
    var str = String(f).replace(/%[sdj%]/g, function (x) {
      if (x === '%%') return '%';
      if (i >= len) return x;
      switch (x) {
        default:
        case '%s':
        case '%d':
        case '%j':
          return inspect(args[i++], ctx);
      }
    });

    for (var x = args[i]; i < len; x = args[++i]) {
      str += ' ' + inspect(x, ctx);
    }

    return str;
  }

  inspectArguments(data) {
    return this.format(...data.args);
  }

  inspectTags(data) {
    return ((data.persistent['tags'] || []).map(tag => chalk.cyan(`${String(tag).toUpperCase()}`)))
        .concat((data.transient['tags'] || []).map(tag => chalk.magenta(`${String(tag).toUpperCase()}`))).join(' ');
  }

  inspectPre(data) {
    return [chalk.yellow.bgBlack(`${data.persistent['app']}-${data.persistent['id']}`), chalk.black.bgYellow(` ${data.expose.toUpperCase()} `)].join(' ');
  }

  inspectMetrics(data) {
    return _.map(data.transient['metrics'], (value, key) => chalk.cyan(`${key}(${typeof value === 'number' ? value.toFixed(3) : value})`)).join(' ');
  }

  inspectCallSite(data) {
    const site = data.transient['callsite'];
    if (typeof site === 'string') return chalk.gray.dim(site);
    const {file, line} = site || {file: '', line: -1};
    return chalk.gray.dim(`${file.replace(/^.*[\\\/]/, '')}:${line}`);
  }

  through(data, callback) {
    if (data.expose === 'metric') {
      data.args = '';
    }

    const pre = this.inspectPre(data);
    const tags = this.inspectTags(data);
    const metrics = this.inspectMetrics(data);
    const site = this.inspectCallSite(data);
    const pretty = this.inspectArguments(data);
    const inspected = pretty.split('\n').map(line =>`${pre} ${[tags, metrics, line, site].join(' ')}`);

    data.inspected = inspected;

    callback(null, data);
  }
}