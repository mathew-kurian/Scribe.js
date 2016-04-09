import * as Scribe from '../'
import expect from 'expect.js'
import TraceError from 'trace-error';

describe('Basic Scribe', ()=> {

  const console = Scribe.create();

  console.persistent('tags', ['mocha', 'scribe']);

  it('should print objects to terminal', async () => {
    await console.tag('object').log('Inspect object', {test: true});
    await console.tag('object').log('Inspect object', console);
    await console.log();
  });

  it('should print functions to terminal', async () => {
    await console.tag('function').log('Inspect function', Function);
  });

  it('should print metrics to terminal', async () => {
    await console.tag('metric').metric('appTime', 500, 'dbTime', 750).log('Inspect metric');
    await console.tag('metric').metric('appTime', 500, 'dbTime', 750).log()
  });

  it('should print errors to terminal', async () => {
    await console.tag('error').error(new Error('Scribe error test 1'));
    await console.tag('error').error(new Error('Scribe error test 2'));
    await console.tag('error').error(new TraceError('Scribe error test 2', new Error("Sub error")));
    await console.tag('error').error(JSON.stringify(new TraceError('test error', new Error("Sub error")),
                                                    ["message", "arguments", "type", "name", "stack"]));
  });

  it('should print dates to terminal', async () => {
    await console.tag('date').log(new Date());
  });

  it('should print booleans to terminal', async () => {
    await console.tag('boolean').log(true);
  });

  it('should print maps to terminal', async () => {
    let map0 = new Map(), map1 = new WeakMap();
    map0.set('scribe', 'test');
    map1.set({}, 'test');

    await console.tag('map').log(map0);
    await console.tag('map').log(map1);
  });

  it('should print sets to terminal', async () => {
    let set0 = new Set(), set1 = new WeakSet();
    set0.add('scribe');
    set1.add({});

    await console.tag('set').log(set0);
    await console.tag('set').log(set1);
  });

  it('should print promises to terminal', async () => {
    const promise = new Promise(()=> 0);

    await console.tag('promise').log(promise, promise instanceof Promise);
  });
});