/* jshint -W079 */
/**
 * With config
 */

var scribe = require('../scribe')({
    createDefaultConsole : false //Scribe won't attach a fresh console2 to process.console
});

console.log(process.console); //undefined

var myConfigConsole = scribe.console({

    console : {                                      //Default options for all myConfigConsole loggers
        colors : ['rainbow', 'inverse', 'black']
    }

});


myConfigConsole.addLogger('fun');

myConfigConsole.fun('Some rainbow in background !');
