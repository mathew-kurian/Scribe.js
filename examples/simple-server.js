import express from 'express';
import * as Scribe from '../index.js';
import * as JSON2 from '../src/libs/JSON2';

const port = 4005;
const options = {
  "app": 'simple-server',
  "id": process.pid,
  "module": {
    "writer/SocketIO": {
      "port": 50000,
      "options": {}
    },
    "router/Viewer/client": {
      "background": "#131B21",
      "socketPorts": [
        50000
      ]
    }
  },
  "debug": false
};

const console = Scribe.create(options);

console.time('serverStartup');

// default tags
console.persistent('tags', ['mocha', 'scribe']);

var through = {
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
};

// modify an existing pipeline i.e. the express
console.pipe('express', 'express-mongo-socket')
       .unshift(through);

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

  // override default console
  console.override();

  global.console.log('overriden!');

  console.log(`Go to http://localhost:${port}/scribe`);

  console.trace('This is a trace');

  console.timeEnd('serverStartup');
});

// build native app
viewer.getNative().then(()=> console.log('Created native apps!')).catch(err => console.error(err));

setInterval(() => console.log(`Heartbeat - ${Date.now()} ... every 5 seconds`), 5000);