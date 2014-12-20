/* jshint -W079 */

var moment = require('moment'),
    path   = require('path');

var scribe = require('../scribe.js')({
    createDefaultConsole : false
});


/**
 * Create a custom LogWriter
 *
 * It'll save logs under logsConsoleTwo/[user]/[logger]/[DD_MMM_YY].[logger].json
 *
 * @see lib/logWriter.js for details
 */

var myLogWriter = new scribe.LogWriter('logsConsoleTwo');

//Create own getPath and getFilename methods to erase to default ones

myLogWriter.getPath = function (opt) {

    return path.join(
        this.getUser(),
        opt.logger.name
    );

};

myLogWriter.getFilename = function (opt) {

    var now = moment();

    return (now.format('DD_MMM_YY')).toLowerCase() +
        '.' +
        opt.logger.name +
        '.json';

};


/**
 * Create 3 console2 instances
 */

var consoleOne = scribe.console({
    console : {
        colors : 'white'
    },
    logWriter : {
        rootPath : 'logsConsoleOne' //all logs in ./logsConsoleOne
    }
});

var consoleTwo = scribe.console(
    {
        console : {
            colors : 'inverse'
        }
    },
    myLogWriter //don't pass a logWriter config, but a custom LogWriter instead
);

var consoleThree = scribe.console({
    console : {
        colors : 'magenta'
    },
    logWriter : false //don't save logs on disk
});


/**
 * Use the consoles
 *
 * Then check logsConsoleOne and logsConsoleTwo folders
 */

//consoleOne.addLogger('log');
//consoleTwo.addLogger('log');
//consoleThree.addLogger('log');

consoleOne.time().log('Hello World from consoleOne');
consoleTwo.time().log('Hello World from consoleTwo');
consoleThree.time().log('Hello World from consoleThree');

