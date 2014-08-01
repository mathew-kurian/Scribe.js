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
var express = require('express');
var app = express();

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

            scribe.set('maxTagLength', 30); // Any tags that have a length greather than
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

        // Express.js
        // WARNING: ExpressJS must be installed for this to work
        // You also need to start an ExpressJS server in order for
        // this to work.
        // --------------
        app.use(scribe.express.logger(function(req, res) { // Express.js access log
            return true; // Filter out any Express messages
        }));

        // Control Panel
        // WARNING: ExpressJS must be installed for this to work
        // You also need to start an ExpressJS server in order for
        // this to work.
        // --------------
        app.get('/log', scribe.express.controlPanel()); // Enable web control panel

        var server = app.listen(2000, function() {
            console.log('Listening on port %d', server.address().port);
        });

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

            console.info("yeeha"); // [scoped-tag]           yeeha
            console.log("yeeha"); // [scoped-tag]           yeeha

        })(console.t('scoped-tag'));

        console.warn("For the web view...");
        console.warn("Please visit http://localhost:2000/log");

        // test.equal(true, true);
        // test.done();
    }
};