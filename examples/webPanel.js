/* jshint -W079 */
(function () { 
    var scribe  = require('../scribe')(),
        console = process.console,
        express = require('express'),
        app     = express();


    app.get('/', function (req, res) {
        res.send('Hello world, see you at /logs');
    });

    app.use('/logs', scribe.webPanel());


    //Make some logs
    console.addLogger('debug', 'inverse');
    console.addLogger('fun', 'rainbow');

    console.time().fun('hello world');
    console.tag('This is a test').debug('A test');
    console.tag('An object').log({
        a: 'b',
        c : [1, 2, 3]
    });

    app.listen(8080, function () {
        console.time().log('Server listening at port 8080');
    });
}());
