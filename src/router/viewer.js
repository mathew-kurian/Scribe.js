import express, {Router} from 'express';
import mongoose from 'mongoose';
import jade from 'jade';
import basicAuth from 'basic-auth-connect';
import bodyParser from 'body-parser'
import JSONStream from 'JSONStream';
import NwBuilder from 'nw-builder';
import nativePackage from '../../native/package.json';
import {format} from 'url';
import {EntrySchema} from '../writer/MongoDB';
import extend from '../libs/config-extend';
import fs from 'fs';

function getObject(d, def) {
  if (typeof d === 'undefined' || d === null) {
    return def || {};
  } else if (typeof d === 'object') {
    return d;
  } else {
    try {
      return JSON.parse(d);
    } catch (e) {
      return def || {};
    }
  }
}

const viewer = jade.compileFile(`${__dirname}/../../views/viewer.jade`);

export default class Viewer {
  constructor(scribe) {
    this.scribe = scribe;
  }

  getRouter() {
    const scribe = this.scribe;
    const routerOptions = scribe.module('router/Viewer').options;
    const clientOptions = scribe.module('router/Viewer/client').options;

    let conn, Entry;

    mongoose.set('debug', routerOptions.debug);
    conn = mongoose.createConnection(routerOptions.mongoUri);
    Entry = conn.model('Entry', EntrySchema);

    const router = new Router();

    if (routerOptions.username && routerOptions.password) {
      router.use(basicAuth(routerOptions.username, routerOptions.password));
    }

    router.use(express.static(`${__dirname}/../../public`));

    if (routerOptions.useBodyParser) {
      router.use(bodyParser.json());
    }

    const render = (req, res)=> res.send(viewer({config: JSON.stringify(clientOptions)}));

    router.get('/', render);
    router.get('/viewer', render);

    router.post('/rest/timeseries', (req, res) => {
      try {
        if (req.body && req.body.date) {
          req.body.date = req.body.date || {};

          if (req.body.date.$gt) req.body.date.$gt = new Date(req.body.date.$gt);
          if (req.body.date.$gte) req.body.date.$gte = new Date(req.body.date.$gte);
          if (req.body.date.$eq) req.body.date.$eq = new Date(req.body.date.$eq);
          if (req.body.date.$lt) req.body.date.$lt = new Date(req.body.date.$lt);
          if (req.body.date.$lte) req.body.date.$lte = new Date(req.body.date.$lte);
          if (req.body._id && Array.isArray(req.body._id.$in)) req.body._id.$in = req.body._id.$in.map(a => mongoose.Types.ObjectId(a));
          if (req.body._id && typeof req.body._id === 'string') req.body._id = mongoose.Types.ObjectId(req.body._id);
        }
      } catch (e) {
        // ignore
      }

      Entry.aggregate(
        [
          {$match: req.body},
          {
            $project: {
              hour: {
                year: {$year: '$date'},
                month: {$month: '$date'},
                day: {$dayOfMonth: '$date'},
                hour: {$hour: '$date'}
              },
              expose: '$expose'
            }
          },
          {
            $group: {
              _id: {hour: '$hour', expose: '$expose'},
              number: {$sum: 1}
            }
          }
        ], (err, out) => res.json(out || []));
    });

    router.get('/rest/db/:collection', (req, res)=> {
      if (!routerOptions.mongoUri) {
        return res.json({err: 0, docs: []});
      }

      var selector = getObject(req.query.selector);
      var fields = typeof req.query.fields === 'string' ? req.query.fields : '';
      var sort = getObject(req.query.sort, {_id: -1});
      var limit = !isNaN(req.query.limit) ? Math.max(0, parseInt(req.query.limit)) : Number.MAX_SAFE_INTEGER;
      var skip = !isNaN(req.query.skip) ? Math.max(0, parseInt(req.query.skip)) : 0;

      res.type('application/json');

      const stream = Entry.find(selector)
                          .select(...fields.split(' '))
                          .skip(skip)
                          .limit(limit)
                          .sort(sort)
                          .stream();

      stream
        .pipe(JSONStream.stringify())
        .pipe(res);
    });

    router.delete('/rest/db/:collection', (req, res)=> {
      if (!routerOptions.mongoUri) {
        res.status(410);
        return res.send();
      }

      var ids = req.query.id;

      try {
        ids = JSON.parse(ids);
      } catch (e) {
        // ignore
      }

      if (!Array.isArray(ids)) {
        ids = [req.param('id')];
      }

      Entry.remove({_id: {$in: ids}}, err => {
        res.status(err ? 410 : 200);
        res.send();
      });
    });

    if (routerOptions.native) {

    }

    return router;
  }

  getNative() {
    const scribe = this.scribe;
    const nativeOptions = scribe.module('router/Viewer/native').options;

    // update
    nativePackage.main = format(nativeOptions);

    // save
    fs.writeFileSync(`${__dirname}/../../native/package.json`,
                     JSON.stringify(nativePackage, null, 4), {encoding: 'utf8'});

    const nw = new NwBuilder(extend({
                                      platforms: ['win', 'osx', 'linux'],
                                      buildDir: `${__dirname}/../../public/native`,
                                      version: '0.12.3',
                                      zip: true
                                    }, nativeOptions, {files: `${__dirname}/../../native/**/**`}));

    if (nativeOptions.debug) {
      nw.on('log', d => console.log(d));
    }

    return nw.build();
  }
}

