/* jshint -W079 */
(function() {
    var scribe = require('../scribe')(),
        console = process.console,
        express = require('express'),
        path = require('path'),
        app = express();

    console.addLogger('log', 'green');
    console.addLogger('err', 'red');

    // port
    app.set('port', (process.env.PORT || 5000));

    // public dir
    app.use('/', express.static(path.join(__dirname, 'public')));

    // scribe
    app.use(scribe.express.logger());
    app.use('/logs', scribe.webPanel());

    // index
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
    });

    function _param(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec("https://r.com?" + this.body);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // log
    app.post('/', function(req, res) {

        req.body = '';
        req.setEncoding('utf8');

        req.on('data', function(chunk) {
            req.body += chunk;
        });

        req.on('end', function() {
            req.param = _param;

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
            if (typeof tag === 'undefined') {
                console.log(msg);
            } else {
                console.tag(tag).log(msg);
            }

            res.status(200).send("Server logged message");
        });

        req.on('close', function(err){
            console.err(err);
            res.status(400).json("Server read stream closed unexpectedly. Check console.");
        });

    });

    var port = app.get('port');

    app.listen(port, function() {
        console.time().log('Server listening at port ' + port);
    });
})();