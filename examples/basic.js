/*jshint -W079 */

require('../scribe')(); //loads Scribe

var console = process.console;

console.log("Console log");
console.info("Console info");
console.error("Console error");
console.warning("Console warning");
console.dir({
    foo : 'bar'
});
