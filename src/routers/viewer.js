import express, {Router} from 'express'
import mongoose from 'mongoose'
import EntrySchema from '../schemas/entry'
import jade from 'jade'
import session from 'express-session'
import basicAuth from 'basic-auth';
import bodyParser from 'body-parser'

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
const login = jade.compileFile(`${__dirname}/../../views/login.jade`);

export function create(mongoUri = 'mongodb://localhost/scribe', routerConfig = {}, clientConfig = {}, debug = false) {
  routerConfig = Object.assign({
    useBodyParser: true,
    username: 'build',
    password: 'build'
  }, routerConfig);

  let conn, Entry;

  if (mongoUri) {
    mongoose.set('debug', debug);
    conn = mongoose.createConnection(mongoUri);
    Entry = conn.model('Entry', EntrySchema);
  }

  const router = new Router();

  var authenticate = function (req, res, next) {
    function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }

    if (!routerConfig.authorization || (!routerConfig.username && !routerConfig.password)) {
      return next();
    }

    var user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    }

    if (user.name === routerConfig.username && user.pass === routerConfig.password) {
      return next();
    } else {
      return unauthorized(res);
    }
  };

  router.use(authenticate);
  router.use(express.static(`${__dirname}/../../public`));

  if (routerConfig.useBodyParser) {
    router.use(bodyParser.json());
  }

  router.get('/viewer', (req, res)=> res.send(viewer({config: JSON.stringify(clientConfig)})));

  router.get('/rest/:collection', (req, res)=> {
    if (!mongoUri) {
      return res.json({err: 0, docs: []});
    }

    var collection = req.params.collection;
    var selector = getObject(req.query.selector);
    var fields = typeof req.query.fields === 'string' ? req.query.fields : '';
    var sort = getObject(req.query.sort, {_id: -1});
    var limit = !isNaN(req.query.limit) ? Math.max(0, parseInt(Number(req.query.limit))) : Number.MAX_SAFE_INTEGER;
    var col = Entry; // defaulting to Entry for now

    if (!col) {
      return res.json({err: 1, docs: []});
    }

    col.find(selector)
        .select(fields)
        .sort(sort)
        .limit(limit)
        .lean()
        .exec((err = 0, docs = []) => res.json({err, docs}));
  });

  router.delete('/rest/:collection', (req, res)=> {
    if (!mongoUri) {
      res.status(410);
      return res.send();
    }

    var collection = rreq.params.collection;
    var ids = req.query.id;

    try {
      ids = JSON.parse(ids);
    } catch (e) {
      // ignore
    }

    if (!Array.isArray(ids)) {
      ids = [req.param('id')];
    }

    var col = Entry; // defaulting to Entry for now

    if (col) {
      return col.remove({_id: {$in: ids}}, err => {
        res.status(err ? 410 : 200);
        res.send();
      });
    }

    res.status(410);
    res.send();
  });

  return router;
}

