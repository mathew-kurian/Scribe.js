import chalk from 'chalk'

export default class ExpressInspector {
  constructor(colors = true, symbols = false) {
    this.colors = colors;
    this.symbols = symbols;
  }

  status(express) {
    const stat = express.status;
    let symbol = '✓';
    let color = '';

    if (100 <= stat && stat < 200) {
      symbol = '';
    } else if (200 <= stat && stat < 300) {
      symbol = '✓';
    } else if (300 <= stat && stat < 400) {
      symbol = '';
    } else if (400 <= stat && stat < 500) {
      symbol = '✘';
      color = 'red';
    } else {
      symbol = ''
    }

    let ret;
    if (this.symbols) {
      ret = `${symbol} ${stat}`;
    } else {
      ret = `${stat}`;
    }

    return color ? chalk[color](ret) : ret;
  }

  through(data, callback) {
    const express = data.args[0];

    data.transient['callsite'] = `${express.ip}`;
    data.args = [`${chalk.bgGreen.black(` ${express.method} `)} ${chalk.gray(express.originalUrl)} ${this.status(express)} - ${express.contentLength} ${chalk.gray(`(${express.duration.toFixed(3)}ms)`)}`];

    callback(null, data);
  }
}