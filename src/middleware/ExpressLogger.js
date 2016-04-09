import onFinish from 'on-finished'
import time from '../libs/time';

export default class ExpressLogger {
  constructor(scribe) {
    this.options = scribe.module('middleware/ExpressLogger').options;
    this.scribe = scribe;
  }

  getMiddleware() {
    const {scribe, options} = this;

    return (req, res, next) => {
      let start = time();
      onFinish(res, () => {
        const {originalUrl} = req;
        for (const k of options.ignore) {
          if (new RegExp(k).test(originalUrl)) {
            return;
          }
        }

        scribe[options.expose]({req, res, duration: (time() - start)});
      });

      next();
    }
  }
}
