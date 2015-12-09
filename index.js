import VF from './file';
import {
  generateSequence,
  logger,
  noop
} from './utils';

const RUN = Symbol('run');
const SRC_F = Symbol('src');
const REDUCE_F = Symbol('reduce');
const MAP_F = Symbol('map');

const sequence = generateSequence(0);

class Capuchin {

  constructor(opts, type, transform, ...sources) {
    this.id = sequence.next().value;
    this.opts = opts;
    this.type = type;
    this.transform = transform || noop;
    this.children = new Set();
    this.inputs = new Map();
    this.output = new Map();
    sources.forEach((src) => {
      if (typeof src === 'string') {
        this.inputs.set(src, new VF(src));
      } else if (Array.isArray(src)) {
        // assume array of glob paths
      } else if (src instanceof Capuchin) {
        this.dep(src[RUN]);
      }
    });
    // this[RUN](Promise.resolve(this.inputs));
  }

  [RUN](input) {
    this.log('running');
    return input
      .then((data) => {
        this.log('checking for data integrity');
        if (!(data instanceof Map)) {
          throw new Error('only Maps can be passed around');
        }
        for (let [path, vf] of data) {
          if (!(vf instanceof VF)) {
            throw new Error('only VF instances allowed');
          }
          this.inputs.set(path, vf);
        }
      })
      .then((data) => {
        this.log('running transformation');
        let p = this.transform(data);
        if (!(p instanceof Promise)) {
          p = Promise.resolve(p);
        }
        return p;
      })
      .then((data) => this.out = data)
      .then((data) => {
        if (this.children.size <= 0) {
          return data;
        }
        var arr = [];
        this.children.forEach((func) => {
          arr.push(func(data));
        });
        return Promise.all(arr);
      });
  }

  dep(func) {
    this.log('adding children');
    this.children.add(func);
  }

  src(...sources) {
    this.log('adding sources');
    return new Capuchin(this.opts, SRC_F, noop, this, ...sources);
  }

  reduce(func) {
    this.log('adding reduce');
    return new Capuchin(this.opts, REDUCE_F, func, this);
  }

  map(func) {
    this.log('adding map');
    return new Capuchin(this.opts, MAP_F, func, this);
  }

  log(...args) {
    logger(this.id, this.transform ? this.transform.name : '', ...args);
  }

  once() {
    setTimeout(function() {
      this[RUN](Promise.resolve(this.inputs));
    }.bind(this), 0);
    return this;
  }

}

let pipeline = new Capuchin({ a: 1 }).once();

let test1 = pipeline
  .src('alizain', 'zee')
  .reduce(function test(files) {
    log('hahaha ' + files);
    return files;
  });
