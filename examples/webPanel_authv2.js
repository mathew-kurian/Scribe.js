/* jshint -W079 */
(function() {
    var express = require('express'),
        app = express(),
        scribe = require('../scribe')(),
        console = process.console;


    app.set('port', (process.env.PORT || 5000));

    /**
     * User : test
     * Pwd  : tes
     */

    app.get('/', function(req, res) {
        res.send('Hello world, see you at /logs');
    });

    //Handle your authentication here... use next if valid... redirect away otherwise!
    var auth = function(req, res, next) {
      if (req.user.admin) {
        return next();
      }
      return res.redirect("/");
    };

    app.use('/logs', auth, scribe.webPanel());

    //Make some logs
    console.addLogger('log');
    console.addLogger('debug', 'inverse');
    console.addLogger('fun', 'rainbow');

    console.time().fun('hello world');
    console.tag('This is a test').debug('A test');
    console.tag('An object').log({
        a: 'b',
        c: [1, 2, 3]
    });

    var port = app.get("port");

    app.listen(port, function() {
        console.time().log('Server listening at port ' + port);
    });
})();
/* jshint -W079 */
(function() {
    var express = require('express'),
        app = express(),
        scribe = require('../scribe')(),
        console = process.console;


    app.set('port', (process.env.PORT || 5000));

    /**
     * User : test
     * Pwd  : tes
     */

    app.get('/', function(req, res) {
        res.send('Hello world, see you at /logs');
    });

    //Handle your authentication here... use next if valid... redirect away otherwise!
    var auth = function(req, res, next) {
      if (req.user.admin) {
        return next();
      }
      return res.redirect("/");
    };

    app.use('/logs', auth, scribe.webPanel());

    //Make some logs
    console.addLogger('log');
    console.addLogger('debug', 'inverse');
    console.addLogger('fun', 'rainbow');

    console.time().fun('hello world');
    console.tag('This is a test').debug('A test');
    console.tag('An object').log({
        a: 'b',
        c: [1, 2, 3]
    });

    var port = app.get("port");

    app.listen(port, function() {
        console.time().log('Server listening at port ' + port);
    });
})();
