export default class ErrorExtractor {
  through(data, callback) {
    data.args = data.args.map(a => a instanceof Error ?
        JSON.parse(JSON.stringify(a, ["message", "arguments", "type", "name", "stack"])) : a);

    callback(null, data);
  }
}