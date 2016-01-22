import {Readable,Writable, Transform} from 'stream'
import {inspect} from 'util'

class Console extends Readable {
  constructor(options = {}, stream) {
    super(Object.assign(options, {objectMode: true}), stream);
  }

  _read() {
    if (Array.isArray(this.content)) {
      this.push(this.content);
      this.content = null;
    }
  }

  out(...args) {
    this.content = args;
    this.read();
  }
}

class Sink extends Writable {
  constructor(options = {}) {
    super(Object.assign(options, {objectMode: true}));
  }

  _write(data, enc, next) {
    console.log(...data);
    next();
  }
}

class Inspect extends Transform {
  constructor(options = {}) {
    super(Object.assign(options, {objectMode: true}))
  }

  _transform(chunk, encoding, callback) {
    this.push(inspect(chunk, {colors: true}) + '\n');
    callback();
  }
}


describe('Simple Streams', ()=> {
  const s = new Console();
  s.pipe(new Sink());
  s.pipe(new Inspect()).pipe(process.stdout);

  it('should use streams to transfer data', done => {
    s.out("new Testing", "multi-arg");
    s.out("How now brown cow?");
    done();
  });
});