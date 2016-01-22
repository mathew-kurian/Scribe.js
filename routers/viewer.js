import express, {Router} from 'express'
import mongoose from 'mongoose'
import EntrySchema from '../schemas/entry'
import jade from 'jade'
import session from 'express-session'
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

const viewer = jade.compileFile(`${__dirname}/../views/viewer.jade`);
const login = jade.compileFile(`${__dirname}/../views/login.jade`);

export function create(mongoUri = 'mongodb://localhost/scribe', routerConfig = {}, clientConfig = {}, debug = false) {
  routerConfig = Object.assign({
    sessionSecret: 'scribe-session',
    useSession: true,
    useBodyParser: true,
    username: 'build',
    password: 'build'
  }, routerConfig);

  mongoose.set('debug', debug);

  const router = new Router();
  const conn = mongoose.createConnection(mongoUri);
  const Entry = conn.model('Entry', EntrySchema);

  router.use(express.static('public'));

  function isAuthenticated(req, res, next) {
    if (!routerConfig.authentication || req.session.authenticated) {
      return next();
    }

    res.redirect(req.baseUrl);
  }

  if (routerConfig.useSession) {
    router.use(session({secret: routerConfig.sessionSecret, saveUninitialized: true, resave: true}));
  }

  if (routerConfig.useBodyParser) {
    router.use(bodyParser.json());
  }

  router.post('/', (req, res)=> {
    req.session.authenticated |=
        !routerConfig.authentication ||
        (req.body.username === routerConfig.username && req.body.password === routerConfig.password);
    if (req.session.authenticated) {
      return res.json({data: 'viewer'});
    }

    res.json({status: 1, message: 'Invalid username/password'});
  });

  router.get('/', (req, res)=> {
    if (!routerConfig.authentication || req.session.authenticated) {
      return res.redirect('viewer');
    }

    res.send(login());
  });

  router.get('/viewer', isAuthenticated, (req, res)=> res.send(viewer({
    config: JSON.stringify(clientConfig)
  })));

  router.get('/rest/:collection', isAuthenticated, (req, res)=> {
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

  router.delete('/rest/:collection', isAuthenticated, (req, res)=> {
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

