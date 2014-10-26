/*jshint -W020 */

(function () {

    'use strict';

    var Console2 = require('./lib/console2.js');

    /**
     * scribe
     *
     * Scribe.js module
     *
     * @param {Object}       opt                    Options
     * @param {Boolean}      createDefaultConsole   Should scribe attach a fresh Console2 to process.console ? 
     *                                              Default true.
     *
     * @return {Object}
     * @return {Function}    console                Get a console
     * @return {Constructor} Console2               Console2 constructor
     */
    var scribe = function (opt) {

        //Scribe options

        if (!opt) {
            opt = {};
        }

        opt.createDefaultConsole = opt.createDefaultConsole !== false;


        if (opt.createDefaultConsole) {
            //Create a default console2 and attach it to process
            process.console = new Console2();
        }


        return  {
            console  : function (config) {
                var console = new Console2(config.console || {});
                //add here event listeners for file saver
                return console;
            },
    
            Console2 : Console2
        };
    };  

    module.exports = scribe;

}());
