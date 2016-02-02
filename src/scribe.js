import fs from 'fs'
import path from 'path'
import Console from './readers/Console'
import BasicConsole from './readers/BasicConsole'
import Inspector from './transforms/Inspector'
import ExpressInspector from './transforms/ExpressInspector'
import ExpressExtractor from './transforms/ExpressExtractor'
import JSON2Converter from './transforms/JSON2Converter'
import ErrorExtractor from './transforms/ErrorExtractor'
import MongoDB from './writers/MongoDB'
import SocketIO from './writers/SocketIO'
import DefaultConsole from './writers/DefaultConsole'
import {create} from './routers/viewer'
import NwBuilder from 'nw-builder'
import rc from 'rc'
import nativePackage from './../native/package.json'
import extend from 'extend'

export const Writer = {MongoDB, DefaultConsole};
export const Reader = {BasicConsole, Console};
export const Transform = {Inspector, ExpressInspector, ExpressExtractor, ErrorExtractor, JSON2Converter};

const defaultOpts = {
  name: 'Scribe',
  mongoUri: 'mongodb://localhost/scribe',
  mongo: true,
  basePath: 'scribe/',
  socketPort: 4000,
  socket: true,
  inspector: {
    colors: true,
    showHidden: false,
    depth: 5,
    pre: true,
    callsite: true,
    tags: true,
    args: true,
    metrics: true
  },
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
      socketPorts: [4000],
      exposed: {
        all: {label: 'all', query: {expose: {$exists: true}}},
        //error: {label: 'error', query: {expose: 'error'}},
        //express: {label: 'express', query: {expose: 'express'}},
        //info: {label: 'info', query: {expose: 'info'}},
        //log: {label: 'log', query: {expose: 'log'}},
        //warn: {label: 'warn', query: {expose: 'warn'}},
        //trace: {label: 'trace', query: {expose: 'trace'}}
      }
    }
  },
  nwjs: {},
  debug: false
};

export default function (id = process.pid, opts = rc('scribe', defaultOpts), ...exposers) {
  opts = extend(true, {}, defaultOpts, opts);

  var console = new BasicConsole(opts.name, id || opts.instanceId);

  function appendTransforms(args) {
    if (opts.mongo && opts.mongoUri && opts.socket && opts.socketPort) {
      args.push(new JSON2Converter());
      args.push(new MongoDB(opts.mongoUri, opts.debug));
      args.push(new SocketIO(opts.socketPort, opts.debug));
    } else if (opts.mongo && opts.mongoUri) {
      args.push(new JSON2Converter());
      args.push(new MongoDB(opts.mongoUri, opts.debug));
    } else if (opts.socket && opts.socketPort) {
      args.push(new JSON2Converter());
      args.push(new SocketIO(opts.socketPort, opts.debug));
    }

    return args;
  }

  console.exposed().concat(exposers).forEach(expose => {
    console.expose(expose);

    let args = appendTransforms([expose, 'mongo-socket', new ErrorExtractor()]);

    console.pipe.apply(console, args);

    console.pipe(expose, 'bash',
        new Inspector(opts.inspector),
        new DefaultConsole());
  });

  let args = appendTransforms(['express', 'mongo-socket', new ErrorExtractor(), new ExpressExtractor()]);

  console.pipe.apply(console, args);

  console.pipe('express', 'bash',
      new ExpressExtractor(),
      new ExpressInspector(),
      new Inspector(opts.inspector),
      new DefaultConsole());

  console.viewer = create.bind(null, opts.mongo && opts.mongoUri, opts.web.router, opts.web.client, opts.debug);

  console.build = ()=> {

    // update
    nativePackage.main = `${opts.publicUri}:${path.join(String(opts.web.client.port), opts.basePath)}`;

    // save
    fs.writeFileSync(`${__dirname}/../native/package.json`, JSON.stringify(nativePackage, null, 4), {encoding: 'utf8'});

    const nw = new NwBuilder(extend(true, {
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