'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var scribe = require('../');

exports['read'] = {
    "to-obj": function(test) {
        test.expect(1);

        // Configuration
        // --------------
        scribe.configure(function() {
            scribe.set('app', 'MY_APP_NAME'); // NOTE Best way learn about these settings is
            scribe.set('logPath', './test/logs'); // Doublecheck     // them out for yourself.
            scribe.set('defaultTag', 'DEFAULT_TAG');
            scribe.set('divider', ':::');
            scribe.set('identation', 5); // Identation before console messages

            scribe.set('maxTagLength', 50); // Any tags that have a length greather than
            // 30 characters will be ignored

            // scribe.set('mainUser', 'root'); // Username of the account which is running
            // the NodeJS server
        });

        // Create Loggers
        // --------------
        scribe.addLogger("log", true, true, 'green'); // (name, save to file, print to console,
        scribe.addLogger('realtime', true, true, 'underline'); // tag color)
        scribe.addLogger('high', true, true, 'magenta');
        scribe.addLogger('normal', true, true, 'white');
        scribe.addLogger('low', true, true, 'grey');
        scribe.addLogger('info', true, true, 'cyan');


        // Basic logging
        // --------------
        console.log("[Tagname] Your message"); // [Tagname]             Your message
        console.realtime("[Tagname]   Your message"); // [Tagname]             Your message
        console.high("[Tagname]         Your message  "); // [Tagname]             Your message
        console.normal("[Tagname][]Your message"); // [Tagname]             []Your message
        console.low("[Tagname]Your message"); // [Tagname]             Your message

        // Tagging function
        // ----------------
        console.t("Tagname").log("Your message"); // [Tagname]             Your message
        console.t("Tagname").log("Your message"); // [Tagname]             Your message
        console.t("Tagname").log("Your message"); // [Tagname]             Your message

        // Force use default tag
        // ---------------------
        console.t().log("Your message"); // [MY_APP_NAME]         Your message

        // Pass in file name
        // -----------------
        console.f(__filename).log("Your message"); // [file.js]              Your message

        // Auto tagging
        // ------------
        console.log("Your message"); // [invokedFrom.js:25]    Your message

        // Tag Scoping
        // -----------
        (function(console) {

            console.info("yeeha");
            console.log("yeeha");

            // Tag Scoping
            // -----------
            (function(console) {

                // Tag Scoping
                // -----------
                (function(console) {

                    console.info("yeeha");
                    console.log("yeeha");

                })(console.t('l3'));

                console.info("yeeha");
                console.log("yeeha");

            })(console.t('l2'));

        })(console.t('l1'));


        // File Scoping
        // -----------
        (function(console) {

            console.info("yeeha");
            console.log("yeeha");

            // File Scoping
            // -----------
            (function(console) {

                // File Scoping
                // -----------
                (function(console) {

                    // Note: a use of console.t(...) resets the
                    console.t("LOL").info("yeeha");

                    console.info("yeeha");
                    console.log("yeeha");

                })(console.f());

                console.info("yeeha");
                console.log("yeeha");

            })(console.f());

        })(console.f());

        // Simple Testing
        // --------------
        console.test("Test name").should(5).be(5); // Pretty printed test results

        test.equal(true, true);
        test.done();
    }
};