/* jshint -W079 */

var scribe = require('../scribe.js')({
    createDefaultConsole : false 
});

var consoleOne = scribe.console({
    console : {
        colors : 'white'
    },
    logWriter : {
        rootPath : 'logsConsoleOne' //all logs in ./logsConsoleOne
    }
});

var consoleTwo = scribe.console({
    console : {
        colors : 'inverse'
    },
    logWriter : {
        rootPath : 'logsConsoleTwo' //all logs in ./logsConsoleTwo
    }
});

var consoleThree = scribe.console({
    console : {
        colors : 'magenta'
    },
    logWriter : false //don't save logs on disk
});

consoleOne.addLogger('log');
consoleTwo.addLogger('log');
consoleThree.addLogger('log');

consoleOne.time().log('Hello World from consoleOne');
consoleTwo.time().log('Hello World from consoleTwo');
consoleThree.time().log('Hello World from consoleThree');
