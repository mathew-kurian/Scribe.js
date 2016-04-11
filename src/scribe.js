import fs from 'fs';
import path from 'path';
import rc from 'rc'
import extend from 'extend';

import * as Middleware from './middleware';
import * as Reader from './reader';
import * as Router from './router';
import * as Transform from './transform';
import * as Writer from './writer';

export {Middleware};
export {Reader};
export {Router};
export {Transform};
export {Writer};

export function resolvePipeline(scribe, pipeline) {
  const resolved = [];
  for (const through of pipeline) {
    if (typeof through === 'function') {
      resolved.push(new through(scribe));
    } else if (typeof through === 'object') {
      resolved.push(through);
    } else if (typeof through === 'string') {
      const Class = require(path.join(__dirname, through)).default;
      resolved.push(new Class(scribe));
    }
  }

  return resolved;
}

const defaultOpts = fs.readFileSync(`${__dirname}/../.scriberc`, 'utf8');

export function create(opts) {
  opts = extend(true, rc('scribe', JSON.parse(defaultOpts)), opts);

  // create default console
  const console = new Reader.BasicConsole(opts);
  const {expose: exposeMap, 'expose/pipeline': pipelineMap} = opts;

  [...console.exposed(), ...Object.keys(exposeMap)]
    .forEach(expose => {
      if (expose === 'default') return;
      const pipelines = exposeMap[expose] || exposeMap.default;
      if (Array.isArray(pipelines)) {
        pipelines.forEach(pipeline => {
          if (Array.isArray(pipelineMap[pipeline])) {
            if (opts.debug) {
              process.stdout.write(`Exposing ${expose} through ${pipeline}\n`);
            }

            console.expose(expose);
            console.pipe(expose, pipeline, ...resolvePipeline(console, pipelineMap[pipeline]));
          }
        });
      }
    });

  if (opts.handleUncaughtException) {
    process.on('uncaughtException', e => console.error(e).then(() => process.exit(1)));
  }

  return console;
}
