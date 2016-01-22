import cluster from 'cluster'
import http from 'http'
import express from 'express'
import Scribe from '../index.js'
import * as JSON2 from '../libs/JSON2'

const port = 4005;
const socketPort = 50000;
const cpus = 4;

if (cluster.isMaster) {
  for (var i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  const console = new Scribe(cluster.worker.id, {
    name: 'ScribeCluster',
    mongoUri: 'mongodb://localhost/scribe',
    publicUri: 'http://localhost',
    basePath: 'scribe/',
    socketPort: socketPort + cluster.worker.id - 1, // assign a port to a worker worker
    web: {
      router: {
        username: 'build',
        password: 'build',
        // authentication must be implemented by yourself
        // if you are in cluster mode
        authentication: false,
        sessionSecret: 'scribe-session',
        useBodyParser: true,
        useSession: true
      },
      client: {
        port: port,
        socketPorts: [socketPort, socketPort + 1, socketPort + 2, socketPort + 3],
        exposed: {
          all: {label: 'all', query: {expose: {$exists: true}}},
          error: {label: 'error', query: {expose: 'error'}},
          express: {label: 'express', query: {expose: 'express'}},
          info: {label: 'info', query: {expose: 'info'}},
          log: {label: 'log', query: {expose: 'log'}},
          warn: {label: 'warn', query: {expose: 'warn'}},
          trace: {label: 'trace', query: {expose: 'trace'}},
          perf: {label: 'perf', query: {expose: 'perf'}}
        }
      }
    },
    debug: false
  });

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

  // express logger
  app.use(console.middleware('express'));

  // test harness
  app.get('/test', (req, res) => {
    console.log({multi: "object"}, {test: 5}, {date: new Date()}).then(()=> {
      res.json({test: new Array(parseInt(Math.random() * 50)).join('.')})
    });
  });

  // viewer
  app.use('/scribe', console.viewer());

  app.listen(port, () => console.log(`Listening to ${port} - Cluster ${cluster.worker.id}`));

  // build native app
  if (cluster.worker.id == 1) {
    console.build().then(()=> console.log('Created native apps!')).catch(err => console.error(err));
  }

  // override default console
  console.override();

  global.console.log('overriden!');

  console.log(`Go to http://localhost:${port}/scribe`);

  console.trace('This is a trace');

  console.warn('Warning!!');
}