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
        colors     : 'white',
        tagsColors : 'red',
        timeColors : ['grey', 'underline'],
        dateColors : ['gray', 'bgMagenta'],
        fileColors : 'white',
        lineColors : ['yellow', 'inverse']
    },

    createBasic : false                             //Don't create basic loggers

});


myConfigConsole.addLogger('fun', ['rainbow', 'inverse', 'black']);

myConfigConsole.fun('Some rainbow in background !');

myConfigConsole.addLogger('log', null,
    {
        defaultTags : [{msg : 'Default tag', colors: 'cyan'}]
    }
);

myConfigConsole.tag('A tag', 123).log('custom tags');
myConfigConsole.time().log('custom time');
myConfigConsole.date().log('custom date');
myConfigConsole.file().log('custom file');
