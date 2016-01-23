import fs from 'fs'
import path from 'path'
import Console from './readers/Console'
import BasicConsole from './readers/BasicConsole'
import Inspector from './transforms/Inspector'
import ExpressInspector from './transforms/ExpressInspector'
import ExpressExtractor from './transforms/ExpressExtractor'
import ErrorExtractor from './transforms/ErrorExtractor'
import MongoDB from './writers/MongoDB'
import SocketIO from './writers/SocketIO'
import DefaultConsole from './writers/DefaultConsole'
import {create} from './routers/viewer'
import NwBuilder from 'nw-builder'
import rc from 'rc'
import nativePackage from './../native/package.json'

export const Writer = {MongoDB, DefaultConsole};
export const Reader = {BasicConsole, Console};
export const Transform = {Inspector, ExpressInspector, ExpressExtractor, ErrorExtractor};

const defaultOpts = {
  name: 'Scribe',
  mongoUri: 'mongodb://localhost/scribe',
  publicUri: 'http://localhost',
  basePath: 'scribe/',
  socketPort: 4000,
  web: {
    router: {
      username: 'build',
      password: 'build',
      authentication: true,
      sessionSecret: 'scribe-session',
      useBodyParser: true,
      useSession: true
    },
    client: {
      port: 4005,
      socketPorts: [4000],
      exposed: {
        all: {label: 'all', query: {expose: {$exists: true}}},
        error: {label: 'error', query: {expose: 'error'}},
        express: {label: 'express', query: {expose: 'express'}},
        info: {label: 'info', query: {expose: 'info'}},
        log: {label: 'log', query: {expose: 'log'}},
        warn: {label: 'warn', query: {expose: 'warn'}},
        trace: {label: 'trace', query: {expose: 'trace'}}
      }
    }
  },
  nwjs: {},
  debug: false
};

export default function (id = process.pid, opts = rc('scribe', defaultOpts)) {
  opts = Object.assign({}, defaultOpts, opts);

  var console = new BasicConsole(opts.name, id || opts.instanceId);

  console.exposed().forEach(expose => {
    if (opts.mongoUri) {
      console.pipe(expose, 'mongo-socket',
          new ErrorExtractor(),
          new MongoDB(opts.mongoUri, opts.debug),
          opts.socketPort ? new SocketIO(opts.socketPort, opts.debug) : null);
    }

    console.pipe(expose, 'bash',
        new Inspector(),
        new DefaultConsole());
  });

  if (opts.mongoUri) {
    console.pipe('express', 'mongo-socket',
        new ErrorExtractor(),
        new ExpressExtractor(),
        new MongoDB(opts.mongoUri, opts.debug),
        opts.socketPort ? new SocketIO(opts.socketPort, opts.debug) : null);
  }

  console.pipe('express', 'bash',
      new ExpressExtractor(),
      new ExpressInspector(),
      new Inspector(),
      new DefaultConsole());

  opts.web.client.socketUris = opts.web.client.socketPorts.map(port=> `${opts.publicUri}:${port}`);

  console.viewer = create.bind(null, opts.mongoUri, opts.web.router, opts.web.client, opts.debug);

  console.build = ()=> {

    // update
    nativePackage.main = `${opts.publicUri}:${path.join(String(opts.web.client.port), opts.basePath)}`;

    // save
    fs.writeFileSync(`${__dirname}/../native/package.json`, JSON.stringify(nativePackage, null, 4), {encoding: 'utf8'});

    const nw = new NwBuilder(Object.assign({
      platforms: ['win', 'osx', 'linux'],
      buildDir: `${__dirname}/../public/native`,
      version: '0.12.3',
      zip: true
    }, opts.nwjs, {files: `${__dirname}/../native/**/**`}));

    if (opts.debug) {
      nw.on('log', d => console.log(d));
    }

    return nw.build();
  };

  process.on('uncaughtException', e => console.error(e).then(() => process.exit(1)));

  return console;
};