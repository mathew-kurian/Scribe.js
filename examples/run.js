/*jshint -W079 */
/**
 * The main file
 */

require('../scribe')(); //loads Scribe

var console = process.console;      //create a local (for the module) console


//Don't worry, you can still access the original console
global.console.log("I'm using the original console.log()");

//Let's create a new logger `myLoger` ...
console.addLogger('myLogger');
//... and use it !
console.tag('MyTag').time().file().myLogger('Scribe.js is awesome');


//Let's see how to use the new console in a sub-module :
//(just open submodules to see what's going on there)

//By default, submodules still use original console
require('./sub-without_new_console').saySomething("Hello world !");
//But, you can use the new one !
require('./sub-with_new_console').saySomething("Hello world !");
