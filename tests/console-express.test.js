import * as Scribe from '../'
import express from 'express'
import expect from 'expect.js'
import request from 'superagent'
import async from 'async'

describe('Basic Scribe', ()=> {

  const port = 3008;
  const requestsCount = 10;
  const console = Scribe.create();

  console.persistent('tags', ['mocha', 'scribe']);

  it(`should print ${requestsCount} requests to terminal`, done => {

    const app = express();
    let count = 0, did404 = 0;
    const logger = new Scribe.Middleware.ExpressLogger(console);

    app.use(logger.getMiddleware());
    app.get('/test', (req, res) => {
      if (did404) {
        return res.json({test: new Array(parseInt(Math.random() * 50)).join('.')});
      }

      did404++;
      res.status(404);
      res.json({force: 404});
    });

    app.listen(port, () => {
      console.log(`Listening on ${port}`);

      async.each(new Array(requestsCount), (i, callback)=> {
        count++;

        request
          .get(`http://localhost:${port}/test`)
          .end((err, req)=> {
            if (err) {
              return callback();
            } else {
              console
                .log(`Received response ${count}/${requestsCount}`, req.body)
                .then(()=>callback());
            }
          });
      }, () => {
        expect(count).to.equal(requestsCount);
        done();
      });
    });
  });
});