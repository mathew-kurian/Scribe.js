import _ from 'underscore'

export default class DefaultConsole {
  through(data, callback) {
    _.map(data.inspected, a => process.stdout.write(a + '\n'));
    callback();
  }
}