import Scribe from '../'
import expect from 'expect.js'

describe('Basic Scribe', ()=> {

  const console = new Scribe();

  console.persistent('tags', ['mocha', 'scribe']);

  it('should print objects to terminal', done => {
    Promise.all([
      console.tag('object').log('Inspect object', {test: true}),
      console.tag('object').log('Inspect object', console)
    ]).then(() => done());
  });

  it('should print functions to terminal', done => {
    Promise.all([
      console.tag('function').log('Inspect function', Function)
    ]).then(() => done());
  });

  it('should print metrics to terminal', done => {
    Promise.all([
      console.tag('metric').metric('appTime', 500, 'dbTime', 750).log('Inspect metric'),
      console.tag('metric').metric('appTime', 500, 'dbTime', 750).log()
    ]).then(() => done());
  });

  it('should print errors to terminal', done => {
    Promise.all([
      console.tag('error').error(new Error('Scribe error test 1')),
      console.tag('error').error(new Error('Scribe error test 2'))
    ]).then(() => done());
  });

  it('should print dates to terminal', done => {
    Promise.all([
      console.tag('date').log(new Date())
    ]).then(() => done());
  });

  it('should print booleans to terminal', done => {
    Promise.all([
      console.tag('boolean').log(true)
    ]).then(() => done());
  });

  it('should print maps to terminal', done => {
    let map0 = new Map(), map1 = new WeakMap();
    map0.set('scribe', 'test');
    map1.set({}, 'test');

    Promise.all([
      console.tag('map').log(map0),
      console.tag('map').log(map1)
    ]).then(() => done());
  });

  it('should print sets to terminal', done => {
    let set0 = new Set(), set1 = new WeakSet();
    set0.add('scribe');
    set1.add({});

    Promise.all([
      console.tag('set').log(set0),
      console.tag('set').log(set1)
    ]).then(() => done());
  });

  it('should print promises to terminal', done => {
    const promise = new Promise(()=> 0);

    Promise.all([
      console.tag('promise').log(promise, promise instanceof Promise)
    ]).then(() => done());
  });

});