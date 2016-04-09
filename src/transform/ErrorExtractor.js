export default class ErrorExtractor {
  through(data, callback) {
    data.args =
      data.args.map(a =>
                      a instanceof Error ?
                        a.toJSON ?
                          a.toJSON() :
                          JSON.parse(JSON.stringify(a, ["message", "arguments", "type", "name", "stack", "code"]))
                        : a);

    callback(null, data);
  }
}