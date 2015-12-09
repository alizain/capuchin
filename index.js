import Promise from 'bluebird';
import VF from './file';
import {
  generateSequence,
  logger,
  noop
} from './utils';

Promise.onPossiblyUnhandledRejection((err) => {
  throw err;
});

const RUN = Symbol('run');
const SRC_F = Symbol('src');
const REDUCE_F = Symbol('reduce');
const MAP_F = Symbol('map');

const sequence = generateSequence(0);

class Capu {

  constructor(opts, type, transform, ...sources) {
    this.id = sequence.next().value;
    this.opts = opts;
    this.type = type;
    this.transform = transform || noop;
    this.children = new Array();
    this.inputs = new Map();
    this.output = new Map();
    sources.forEach((src) => {
      if (typeof src === 'string') {
        this.inputs.set(src, new VF(src));
      } else if (Array.isArray(src)) {
        // assume array of glob paths
      } else if (src instanceof Capu) {
        src.dep(this);
      }
    });
    // this[RUN](Promise.resolve(this.inputs));
  }

  [RUN](input) {
    this.log('running');
    return Promise.resolve(input)
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
        this.log(this.inputs);
        return data;
      })
      .then((data) => {
        this.log('running transformation');
        this.log(this.transform);
        var p = this.transform(data);
        this.log(typeof p);
        if (!(p instanceof Promise)) {
          p = Promise.resolve(p);
        }
        return p;
      })
      .then((data) => {
        this.out = data;
        return data;
      })
      .then((data) => {
        if (this.children.size <= 0) {
          return data;
        }
        this.log('running children');
        this.log(data);
        let arr = this.children.map((child) => {
          return child[RUN](data);
        });
        return Promise.all(arr);
      });
  }

  dep(func) {
    this.log('adding children');
    this.children.push(func);
  }

  src(...sources) {
    this.log('adding sources');
    return new Capu(this.opts, SRC_F, noop, this, ...sources);
  }

  reduce(func) {
    this.log('adding reducer');
    return new Capu(this.opts, REDUCE_F, func, this);
  }

  map(func) {
    this.log('adding mapper');
    return new Capu(this.opts, MAP_F, func, this);
  }

  log(...args) {
    logger(this.id, ...args);
  }

  once() {
    setImmediate(function wait() {
      this[RUN](this.inputs);
    }.bind(this), 0);
    return this;
  }

}

let pipeline = new Capu({ a: 1 }).once();

let test1 = pipeline
  .src('alizain', 'zee')
  .reduce(function test(files) {
    console.log(typeof files);
    return files;
  })
  .map(function test2(files) {
    console.log(files.size);
    return files;
  });
