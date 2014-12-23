/* jshint -W098 */
(function() {
    var scribe = require('../scribe')(),
        express = require('express'),
        app = express(),
        console = process.console;

    app.set('port', (process.env.PORT || 5000));

    //Create a Console2 for express
    //with logs saved in /expressLogger
    var expressConsole = scribe.console({
        console: {
            colors: 'white',
            timeColors: ['grey', 'underline'],
        },
        createBasic: false,
        logWriter: {
            rootPath: 'expressLogger'
        }
    });

    expressConsole.addLogger('info'); //create a 'info' logger

    //A filter function
    var validate = function(req, res) {

        //if (something) {
        //    return false      //ie. don't log this request
        //else
        //{

        return true;
    };

    //Pass the console and the filter
    app.use(scribe.express.logger(expressConsole, validate));

    var port = app.get("port");

    app.listen(port, function() {
        console.time().log('Server listening at port ' + port);
    });
}());
