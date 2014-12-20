/* jshint -W098 */
(function () {
    var scribe  = require('../scribe')(),
        express = require('express'),
        app     = express(),
        console = process.console;

    //Create a Console2 for express
    //with logs saved in /expressLogger
    var expressConsole = scribe.console({
        console : {
            colors     : 'white',
            timeColors : ['grey', 'underline'],
        },
        createBasic : false,
        logWriter : {
            rootPath : 'expressLogger'
        }
    });

    expressConsole.addLogger('info'); //create a 'info' logger

    //A filter function
    var validate = function (req, res) {

        //if (something) {
        //    return false      //ie. don't log this request
        //else
        //{

        return true;
    };

    //Pass the console and the filter
    app.use(scribe.express.logger(expressConsole, validate));

    app.listen(8080, function () {
        console.time().log('Server listening at port 8080');
    });
}());
