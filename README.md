![Logo](__misc/scribejs design logo [a].png)
=======
**Lightweight NodeJS Logging**
Overview
=======
Unlike many of the libraries out there, Scribe.js allows logging on multiple files and is divided into folders by date. And it is possibly the easiest logging you can implement. And it does everything you need a basic logger to do.
- Save messages into logs
- Print messages into console

Sample
=======
Output to Console
---
![Command Prompt output](https://raw.github.com/bluejamesbond/Scribe.js/master/__misc/scribejs%20sample%20cmd%20%5Ba%5D.PNG)
Directory template
---
![Files Directory](https://raw.github.com/bluejamesbond/Scribe.js/master/__misc/scribejs%20sample%20directory%20%5Ba%5D.PNG)
Output to File
---
![Files output](https://raw.github.com/bluejamesbond/Scribe.js/master/__misc/scribejs%20sample%20file%20%5Ba%5D.PNG)

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
3. Add Scribe into the `app.js`
----
```js
var scribe = require('./scribe');  <---- On the very top of your application.
```
4. Install the required modules
----
```bat
npm install colors
npm install moment
npm install mkdirp
```
5. Logging with Scribe
----
```js
// You can use any of the following anywhere Scribe will
// both SAVE to file and PRINT to console whatever
console.log("[Tagname]Simple message");
console.info("[Tagname]Simple message");
console.warn("[Tagname]Simple message");
console.error("[Tagname]Simple message");
console.realtime("[Tagname]Simple message");
console.high("[Tagname]Simple message");
console.normal("[Tagname]Simple message");
console.low("[Tagname]Simple message");
```
6. Using Scribe and Express
----
```js
// Inside app.js
app.configure(function () {
    app.use(scribe.logger);
}
```
Contributors
=======
```
bluejamesbond
```
