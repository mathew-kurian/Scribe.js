![Logo](__misc/scribejs design logo [a].png)
=======
**Lightweight NodeJS Logging**
Overview
=======
Unlike many of the libraries out there, Scribe.js allows logging on multiple files and is divided into folders by date. And it is possibly the easiest logging you can implement. And it does everything you need a basic logger to do.
- Save messages into log files organized by user, date, and type
- Print messages into console using colors indicating level of importance

Output Methods (Web | Console | File)
=======
Method#Web - Select Date
---
![Control Panel View 1](http://i.imgur.com/sXyDc09.png)
Method#Web - Select Log Type
---
![Control Panel View 1](http://i.imgur.com/NgCa8tR.png)
Method#Web - View Logs
---
![Control Panel View 1](http://i.imgur.com/ULkKn1X.png)
Method#Console - Command Prompt
---
![Command Prompt output](https://raw.github.com/bluejamesbond/Scribe.js/master/__misc/scribejs%20sample%20cmd%20%5Ba%5D.PNG)
Method#File - File
---
![Files output](https://raw.github.com/bluejamesbond/Scribe.js/master/__misc/scribejs%20sample%20file%20%5Ba%5D.PNG)
Method#File - Directory Layout
---
![Files Directory](https://raw.github.com/bluejamesbond/Scribe.js/master/__misc/scribejs%20sample%20directory%20%5Ba%5D.PNG)

How to use Scribe.js
=======
Using Sribe is as simple as putting the contents of the Scribe folder into your root NodeJS folder. Note: What I am about to show you is the simplest way to use Scribe.js. Since this library (if you can even call it that), is not insave at all, and it should be very easy to adjust to your liking.

1. Make a Scribe directory
----
```
\root
    \node_modules
    \views
    \controllers
    \bunchOfOtherFolder...
    \scribe <--- Make a folder named "scribe"
    app.js
```
2. Add Scribe into this folder
----
```
\scribe <--- Copy the contents of the "src" folder (which you get from this repo) into "scribe".
```
4. Install the required modules
----
```bat
npm install colors
npm install moment
npm install mkdirp
npm install callsite
```
5. Logging with Scribe
----
```js
var scribe = require('./scribe');     

// Configuration
// --------------
scribe.configure(function(){
    scribe.set('app', 'MY_APP_NAME');                     // NOTE Best way learn about these settings is
    scribe.set('logPath', './../logs');                   // them out for yourself.
    scribe.set('defaultTag', 'DEFAULT_TAG');
    scribe.set('divider', ':::');
    scribe.set('identation', 5);                          // Identation before console messages
    
    scribe.set('maxTagLength', 30);                       // Any tags that have a length greather than
                                                          // 30 characters will be ignored
    
    scribe.set('mainUser', 'root');                       // Username of the account which is running
                                                          // the NodeJS server
});

// Create Loggers
// --------------
scribe.addLogger("log", true , true, 'green');            // (name, save to file, print to console,
scribe.addLogger('realtime', true, true, 'underline');    // tag color)
scribe.addLogger('high', true, true, 'magenta');
scribe.addLogger('normal', true, true, 'white');
scribe.addLogger('low', true, true, 'grey');

// Express.js
// --------------
app.use(scribe.express.logger(function(req, res){         // Express.js access log
    return true;                                          // Filter out any Express messages
}));

// Control Panel
// --------------
app.get('/log', scribe.express.controlPanel());           // Enable web control panel

// Basic logging
// --------------
console.log("[Tagname] Your message");                    // [Tagname]             Your message  
console.realtime("[Tagname]   Your message");             // [Tagname]             Your message
console.high("[Tagname]         Your message  ");         // [Tagname]             Your message
console.normal("[Tagname][]Your message");                // [Tagname]             []Your message
console.low("[Tagname]Your message");                     // [Tagname]             Your message

// Tagging function
// ----------------
console.t("Tagname").log("Your message");                 // [Tagname]             Your message
console.t("Tagname").log("Your message");                 // [Tagname]             Your message
console.t("Tagname").log("Your message");                 // [Tagname]             Your message

// Force use default tag
// ---------------------
console.t().log("Your message");                          // [MY_APP_NAME]         Your message

// Pass in file name
// -----------------
console.f(__filename).log("Your message");               // [file.js]              Your message

// Auto tagging
// ------------
console.log("Your message");                             // [invokedFrom.js:25]    Your message

```
6. Experimental
----
```js
// Simple Testing
// --------------
console.test("Test name").expect(5).should(5);           // Pretty printed test results    
```
Contributors
=======
```
bluejamesbond
```
