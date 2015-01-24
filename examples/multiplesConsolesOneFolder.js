var scribe = require('../scribe.js')({
   createDefaultConsole : false
});

var consoleOne = scribe.console({
    logWriter : {
        rootPath : "testLogs"
    }
});
var consoleTwo = scribe.console({
    logWriter : {
        rootPath : "testLogs"
    }
});

//both will log in /testLogs
consoleOne.log("Hello one");
consoleOne.log("Hello two");
