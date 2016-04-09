# Scribe 3.0 
[![Build Status](https://travis-ci.org/bluejamesbond/Scribe.js.svg?branch=dev)](https://travis-ci.org/bluejamesbond/Scribe.js)  
Node.js logging made simple! Online access to logs and more... 

```bash
npm install scribe@3.0.0-alpha.5
```

### Features
- Console features a pipeline (i.e. transforms)
- Using React instead of Angular for improvements with large data
- Live notifications with Socket.IO
- Native applications for Windows/Linux/Mac
- MongoDB writer
- Extensive object inspector
- Support for multithreading (clusters)
- Support for logging custom metrics i.e. `databaseResponseTime`
- ES6 and Promise support - see examples
- Aggregated timeseries of the log entries
- Range selection
- Keyword searching

### Future
- Add client-side options i.e. hide/display tags, show timings, abstract away search
- Endpoint response time graphing
- Graphing tools for custom metrics
- Support for third-party plugins i.e. data parsing and performance tracking (in progress)

## Console
![](/screenshots/console-0.png)

## Web
![](https://www.dropbox.com/s/pgjd6eu692fen8y/Screenshot%202016-04-10%2019.52.57.png?dl=1)

## Native
![](/screenshots/native-0.png)

# Start the example
```bash
# run example
git clone https://github.com/bluejamesbond/Scribe.js --branch  es6 --single-branch && cd Scribe.js && npm install && npm run babel-node ./examples/simple-server.js

# native apps (mac, linux, windows)
cd public/native/Scribe && ls -l

# web app
http://localhost:4005/scribe
```

## Reference
Refer to [`examples`](/examples) 

## Custom Pipelines
Documentation coming in the future

```js
// console.pipe(expose, name, ...throughs);
console.pipe('log', 'bash',new Inspector(), new DefaultConsole());
```