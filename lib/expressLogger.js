/* jshint -W098 */
(function () {

    var colorsjs = require('colors/safe'),
        Console2 = require('./console2');

    /**
     * logger
     *
     * @param  {Console2|undefined} console
     * @param  {Function|undefined} validate
     */
    var logger = function (console, validate) {

        if (!(console instanceof Console2)) {

            if (!(process.console instanceof Console2)) {
                throw new Error("No process.console");
            } else {
                console = process.console;
            }
        }

        if (console.info === undefined) {
            throw new Error("No 'info' logger attach to console");
        }

        return function (req, res, next) {

            if (!validate || validate(req, res)) {

                console
                    .time()
                    .tag(
                        {msg : 'Express', colors : 'cyan'},
                        {msg : req.ip, colors : 'red'},
                        {msg : req.method, colors : 'green'},
                        {
                            msg   : (/mobile/i.test(req.headers['user-agent']) ? 'MOBILE' : 'DESKTOP'),
                            colors : 'grey'
                        }
                    )
                    .info(req.url);
            }

            next();
        };

    };

    module.exports = {

        logger : logger

    };
}());
