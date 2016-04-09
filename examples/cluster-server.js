import cluster from 'cluster'
import http from 'http'
import express from 'express'
import * as Scribe from '../index.js';
import * as JSON2 from '../src/libs/JSON2'

const port = 4005;
const socketPort = 50000;
const cpus = 4;

if (cluster.isMaster) {
  for (var i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  const options = {
    "app": 'cluster-server',
    "id": process.pid,
    "module": {
      "writer/SocketIO": {
        "port": socketPort + cluster.worker.id - 1,
        "options": {}
      },
      "router/Viewer/client": {
        "background": "#131B21",
        "socketPorts": [socketPort, socketPort + 1, socketPort + 2, socketPort + 3]
      }
    },
    "debug": false
  };

  const console = Scribe.create(options);

  // default tags
  console.persistent('tags', ['mocha', 'scribe']);

  // basic logging
  function func(foo, bar) {
    console.log('func')
  }

  console.log(JSON2.parse(JSON2.stringify([func, new Promise((req, res)=>0)])));
  console.log({multi: "object"}, {test: 5}, {date: new Date()});

  // express
  const app = express();
  const logger = new Scribe.Middleware.ExpressLogger(console);
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

  app.listen(port, () => console.log(`Listening to ${port} - Cluster ${cluster.worker.id}`));

  // override default console
  console.override();

  global.console.log('overriden!');

  console.log(`Go to http://localhost:${port}/scribe`);

  console.trace('This is a trace');

  console.warn('Warning!!');
}