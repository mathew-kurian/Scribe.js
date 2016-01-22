# Scribe 3.0
Node.js logging made simple! Online access to logs and more... 

```bash
npm install git://github.com/bluejamesbond/Scribe.js.git#dev
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

### Future
- Add client-side options i.e. hide/display tags, show timings, abstract away search
- Endpoint response time graphing
- Graphing tools for custom metrics
- Support for third-party plugins i.e. data parsing and performance tracking (in progress)
- Delete logs from front-end

## Console
![](/screenshots/console-0.png)

## Web
![](/screenshots/web-panel-1.png)

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