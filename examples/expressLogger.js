/* jshint -W098 */
(function() {
    var scribe = require('../scribe')(),
        express = require('express'),
        app = express(),
        console = process.console;

    app.set('port', (process.env.PORT || 5000));

    app.use(scribe.express.logger()); //Log each request

    var port = app.get("port");

    app.listen(port, function() {
        console.time().log('Server listening at port ' + port);
    });
})();
