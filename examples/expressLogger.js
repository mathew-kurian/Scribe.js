/* jshint -W098 */
(function () {
    var scribe  = require('../scribe')(),
        express = require('express'),
        app     = express(),
        console = process.console;

    app.use(scribe.express.logger()); //Log each request

    app.listen(8080, function () {
        console.time().log('Server listening at port 8080');
    });
}());
