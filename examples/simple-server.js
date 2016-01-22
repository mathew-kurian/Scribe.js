import express from 'express'
import Scribe from '../index.js'
import * as JSON2 from '../libs/JSON2'

const port = 4005;
const socketPort = 50000;

const console = new Scribe(process.pid, {
  name: 'Scribe',
  mongoUri: 'mongodb://localhost/scribe',
  publicUri: 'http://localhost',
  basePath: 'scribe/',
  socketPort: socketPort,
  web: {
    router: {
      username: 'build',
      password: 'build',
      authentication: true,
      sessionSecret: 'scribe-session',
      useBodyParser: true,
      useSession: true
    },
    client: {
      port: port,
      socketPorts: [socketPort],
      exposed: {
        all: {label: 'all', query: {expose: {$exists: true}}},
        error: {label: 'error', query: {expose: 'error'}},
        express: {label: 'express', query: {expose: 'express'}},
        info: {label: 'info', query: {expose: 'info'}},
        log: {label: 'log', query: {expose: 'log'}},
        warn: {label: 'warn', query: {expose: 'warn'}},
        trace: {label: 'trace', query: {expose: 'trace'}},
        timing: {label: 'time', query: {expose: 'timing'}},
        user: {label: 'user', query: {'transient.tags': {$in: ['USER ID']}}}
      }
    }
  },
  native: {},
  debug: false
});

console.time('serverStartup');

// default tags
console.persistent('tags', ['mocha', 'scribe']);

// modify an existing pipeline i.e. the express
console.pipe('express', 'mongo-socket').unshift({
  through(data, callback){
    const {req, res} = data.args[0]; // access the req, res objects

    // modify data as needed

    // i.e.
    // add user tags
    const tags = data.transient.tags || [];
    tags.push('USER_ID'); // perhaps put in the user id here
    data.transient.tags = tags;

    callback(null, data);
  }
});

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

app.listen(port, () => {
  console.log(`Listening to ${port}`);

  // basic logging
  function func(foo, bar) {
    console.log('func')
  }

  console.log(JSON2.parse(JSON2.stringify([func, new Promise((req, res)=>0)])));

  console.log({multi: "object"}, {test: 5}, {date: new Date()});

  // override default console
  console.override();

  global.console.log('overriden!');

  console.log(`Go to http://localhost:${port}/scribe`);

  console.trace('This is a trace');

  console.timeEnd('serverStartup');
});

// build native app
console.build().then(()=> console.log('Created native apps!')).catch(err => console.error(err));