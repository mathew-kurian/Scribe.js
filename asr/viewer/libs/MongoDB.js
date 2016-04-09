import minimongo from 'minimongo'
import _ from 'underscore'
import request from 'superagent'
import querystring from 'querystring'

function JQueryHttpClient(method, url, params, data, success, error) {
  url = `${url}?${querystring.stringify(params)}`;

  let req;
  if (method === 'GET') {
    req = request.get(url);
  } else if (method === 'DELETE') {
    req = request.delete(url);
  } else if (method === 'POST') {
    req = request.post(url);
  } else if (method === 'PATCH') {
    req = request.patch(url);
  } else {
    throw new Error('Method undefined');
  }

  req.send(JSON.stringify(data));

  req.end((err, res) => {
    if (err) return error(err);
    let docs = [];
    try {
      docs = JSON.parse(res.text);
    } catch (e) {
      // ignore
    }
    return success(docs);
  }).on('progress', e => console.log('Percentage done: ', e.percent));
}

export default class MongoDB {
  constructor(url = 'rest/db/', namespace = 'scribe', client = 'webapp') {
    this.url = url;
    this.namespace = namespace;
    this.client = client;

    this.remoteDb = new minimongo.RemoteDb(url, client, JQueryHttpClient);
  }

  init() {
    return new Promise((resolve, reject) => {
      new minimongo.MemoryDb({namespace: this.namespace}, localDb => {
        const hybridDb = new minimongo.HybridDb(localDb, this.remoteDb);

        let type;
        if (localDb instanceof minimongo.IndexedDb) {
          type = 'IndexedDb';
        } else if (localDb instanceof minimongo.LocalStorageDb) {
          type = 'LocalStorageDb';
        } else if (localDb instanceof minimongo.MemoryDb) {
          type = 'MemoryDb';
        } else if (localDb instanceof minimongo.WebSQLDb) {
          type = 'WebSQLDb';
        } else {
          throw new Error('Can\'t identify db');
        }

        this.hybridDb = hybridDb;

        resolve(hybridDb, type)
      }, reject);
    });
  }

  addCollection(col) {
    return new Promise((resolve, reject)=> {
      this.hybridDb.localDb.addCollection(col, ()=> {
        this.hybridDb.remoteDb.addCollection(col, ()=> {
          this.hybridDb.addCollection(col, {shortcut: true, interim: false}, err => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    });
  }
}