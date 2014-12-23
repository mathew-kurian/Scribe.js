/* jshint -W079 */
(function() {
    var auth = require('http-auth'), // @see https://github.com/gevorg/http-auth
        express = require('express'),
        app = express(),
        scribe = require('../scribe')(),
        console = process.console;


    app.set('port', (process.env.PORT || 5000));

    /**
     * User : test
     * Pwd  : tes
     */
    var basicAuth = auth.basic({ //basic auth config
        realm: "ScribeJS WebPanel",
        file: __dirname + "/users.htpasswd" // test:test
    });

    app.get('/', function(req, res) {
        res.send('Hello world, see you at /logs');
    });

    app.use('/logs', auth.connect(basicAuth), scribe.webPanel());

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
