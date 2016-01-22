import Scribe from '../'
import express from 'express'
import expect from 'expect.js'
import fetch from 'node-fetch'
import async from 'async'

describe('Basic Scribe', ()=> {

  const port = 3008;
  const requestsCount = 10;
  const console = new Scribe();

  console.persistent('tags', ['mocha', 'scribe']);

  it(`should print ${requestsCount} requests to terminal`, done => {

    const app = express();
    let count = 0, did404 = 0;

    app.use(console.middleware('express'));
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
        fetch(`http://localhost:${port}/test`)
            .then(res => res.text())
            .then(text => console.log(`Received response ${++count}/${requestsCount}`, text))
            .then(()=> callback());
      }, () => {
        expect(count).to.equal(requestsCount);
        done();
      });
    });
  });
});