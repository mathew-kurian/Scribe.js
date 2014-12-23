/* jshint -W079 */
(function() {
    var scribe = require('../scribe')(),
        console = process.console,
        express = require('express'),
        app = express();


    app.set('port', (process.env.PORT || 5000));

    app.get('/', function(req, res) {
        res.send('Hello world, see you at /logs');
    });

    app.use('/logs', scribe.webPanel());


    //Make some logs
    console.addLogger('debug', 'red');
    console.addLogger('fun', 'red');

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
