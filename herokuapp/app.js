/* jshint -W079 */
(function () {
  var Scribe = require('../');
  var express = require('express');
  var path = require('path');
  var bodyParser = require('body-parser');
  var app = express();

  const options = {
    "app": 'simple-server',
    "id": process.pid,
    "module": {
      "writer/MongoDB": {
        "uri": process.env.MONGOLAB_URI || "mongodb://localhost/scribe"
      },
      "router/Viewer": {
        "mongoUri": process.env.MONGOLAB_URI || "mongodb://localhost/scribe"
      },
      "writer/SocketIO": {
        "port": 50000,
        "options": {}
      },
      "router/Viewer/client": {
        "background": "#222",
        "socketPorts": [
          50000
        ]
      }
    },
    "debug": false
  };

  const console = Scribe.create(options);
  const logger = new Scribe.Middleware.ExpressLogger(console);
  const viewer = new Scribe.Router.Viewer(console);

  console.persistent('tags', ['scribe']);

  app.set('port', (process.env.PORT || 5000));

  app.use(logger.getMiddleware());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use('/', express.static(path.join(__dirname, 'public')));

  app.use('/scribe', viewer.getRouter());

  app.post('/', function (req, res) {
    var tag = req.param('tag');
    var msg = req.param('msg');

    if (!msg) {
      return res.status(400).send('Param `msg` not defined');
    }

    try {
      msg = JSON.parse(msg);
    } catch (e) {
      // ignore
    }

    // print
    if (tag) {
      console.tag(tag).log(msg);
    } else {
      console.log(msg);
    }

    res.status(200).send("Success! Check system logs to see your message.");
  });

  var port = app.get('port');

  //log something every 10 minutes
  setInterval(function () {
    console.tag("Test").log("Hi there ! Server date : " + new Date());
  }, 10 * 60 * 1000);

  app.listen(port, function () {
    console.time().log('Server listening at port ' + port);
  });

})();
