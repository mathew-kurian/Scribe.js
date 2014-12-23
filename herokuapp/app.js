/* jshint -W079 */
(function() {
    var scribe = require('../scribe')(),
        console = process.console,
        express = require('express'),
        path = require('path'),
        app = express();

    console.addLogger('log', 'green');

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

    // log
    app.post('/', function(req, res){
        var data = req.param('data');

        if(typeof data === 'undefined'){
            return res.status(400).send('`data` param not defined');
        }

        try {
            data = JSON.parse(data);
        } catch(e){
            // ignore
        }

        // print
        console.log(data);

        res.status(200);
    });

    var port = app.get('port');

    app.listen(port, function() {
        console.time().log('Server listening at port ' + port);
    });
})();
