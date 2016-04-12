import express from 'express'
import * as Scribe from '../index.js';
import * as JSON2 from '../src/libs/JSON2'

const port = 4005;
const socketPort = 3000;

const options = {
  "app": 'simple-server-stream-only',
  "id": process.pid,
  "expose": {
    "default": [
      "socket",
      "bash"
    ],
    "express": [
      "express-socket",
      "express-bash"
    ]
  },
  "expose/pipeline": {
    "socket": [
      "transform/ErrorExtractor",
      "transform/ToJSON2",
      "transform/FullTextSerialize",
      "writer/SocketIO"
    ],
    "express-socket": [
      "transform/ExpressExtractor",
      "transform/ErrorExtractor",
      "transform/ToJSON2",
      "transform/FullTextSerialize",
      "writer/SocketIO"
    ]
  },
  "module": {
    "writer/SocketIO": {
      "port": socketPort,
      "options": {}
    },
    "router/Viewer/client": {
      "background": "#131B21",
      "socketPorts": [
        socketPort
      ]
    }
  },
  "debug": true
};

const console = Scribe.create(options);

console.time('serverStartup');

// default tags
console.persistent('tags', ['mocha', 'scribe']);

// express
const app = express();
const logger = new Scribe.Middleware.ExpressRequestLogger(console);
const viewer = new Scribe.Router.Viewer(console);

// express logger
app.use(logger.getMiddleware());

// viewer
app.use('/scribe', viewer.getRouter());

// test harness
app.get('/test', (req, res) => {
  console.log({multi: "object"}, {test: 5}, {date: new Date()}).then(()=> {
    res.json({test: new Array(parseInt(Math.random() * 50)).join('.')})
  });
});

app.listen(port, () => {
  console.log(`Listening to ${port}`);

  // basic logging
  function func(foo, bar) {
    console.log('func')
  }

  console.log(JSON2.parse(JSON2.stringify([func, new Promise((req, res)=>0)])));

  console.log({multi: "object"}, {test: 5}, {date: new Date()});

  console.log(`Go to http://localhost:${port}/scribe`);

  console.trace('This is a trace');

  console.timeEnd('serverStartup');
});
