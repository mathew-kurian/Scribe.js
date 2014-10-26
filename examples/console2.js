/*jshint -W079 */

/**
 * Console2 functions
 */

require('../scribe')(); //loads Scribe

var console = process.console;      //create a local (for the module) console

console.addLogger('log');

console.log("Hello");

console.time().log("Print the full time");
console.date().log("Just print the date");
console.tag("Tag1", 123).log("Some Tag");
console.file().log("Print the file and the line of the call");
console.log({just : 'an object'});
console.log(
        "Print many things",
        { key1 : "val 1", key2 : { a: "b", c : []}, key3 : [1234]},
        ['an array'],
        "A String"
);

console.tag("Combo!").time().file().log("A combo");

console.log("A string %s and a number %d", "hello", "123"); //you can you printf-like format
