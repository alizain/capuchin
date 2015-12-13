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
const RUN_CHILDREN = Symbol('run_children');
const RUN_TRANSFORM = Symbol('run_transform');
const INITIALIZE = Symbol('initialize');
const SRC_FUNC = Symbol('src');
const MAP_FUNC = Symbol('map');
const REDUCE_FUNC = Symbol('reduce');

const sequence = generateSequence(0);

export class Capu {

  constructor(opts, type, transform, ...sources) {
    this.id = sequence.next().value;
    this.opts = opts;
    this.type = type || SRC_FUNC;
    this.transform = transform || noop;
    this.children = new Array();
    this.inputs = new Map();
    this.output = new Map();
    this[INITIALIZE](sources);
    // this[RUN](Promise.resolve(this.inputs));
  }

  [INITIALIZE](sources) {

    sources.forEach((src) => {
      if (typeof src === 'string') {
        this.inputs.set(src, new VF(src));
      } else if (Array.isArray(src)) {
        // assume array of glob paths
      } else if (src instanceof Capu) {
        src.dep(this);
      }
    });
  }

  [RUN](newInput) {
    this.log('running');
    if (this.type === SRC_FUNC) {
      return this[RUN_CHILDREN](newInput);
    }
    this.log('checking for data integrity');
    if (!(newInput instanceof Map)) {
      throw new Error('only Maps can be passed around');
    }
    for (let [path, vf] of newInput) {
      if (!(vf instanceof VF)) {
        throw new Error('only VF instances allowed');
      }
      this.inputs.set(path, vf);
    }
    let rootP;
    if (this.type === REDUCE_FUNC) {
      this.log('running reduce transformation');
      rootP = Capu[RUN_TRANSFORM](this.transform, this.inputs);
    } else if (this.type === MAP_FUNC) {
      this.log('running map transformation');
      let pArray = [];
      newInput.forEach((path, vf) => {
        return pArray.push(Capu[RUN_TRANSFORM](this.transform, path, vf));
      });
      console.log(pArray);
      rootP = Promise.all(pArray);
    }
    return rootP
      .then((data) => {
        this.out = data;
        return this[RUN_CHILDREN](data);
      })
      .done(function() {
        console.log('yahooo');
      });
  }

  [RUN_CHILDREN](data) {
    if (this.children.length <= 0) {
      return data;
    }
    this.log('running children');
    let p = data;
    if (!(data instanceof Promise)) {
      p = Promise.resolve(data);
    }
    return p.then((d) => {
      let pArray = this.children.map((func) => {
        return func[RUN](d);
      });
      return Promise.all(pArray);
    });
  }

  static [RUN_TRANSFORM](func, data) {
    let result = func(data);
    if (result instanceof Error) {
      throw result;
    } else if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }
    return result;
  }

  dep(func) {
    this.log('adding children');
    this.children.push(func);
  }

  src(...sources) {
    this.log('adding sources');
    return new Capu(this.opts, SRC_FUNC, noop, this, ...sources);
  }

  next(func, type) {
    this.log('adding next function');
    let opts = Object.assign({}, this.opts, { type: type });
    return new Capu(opts, null, func, this);
  }

  reduce(func) {
    this.log('adding reducer');
    return new Capu(this.opts, REDUCE_FUNC, func, this);
  }

  map(func) {
    this.log('adding mapper');
    return new Capu(this.opts, MAP_FUNC, func, this);
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

console.log('starting execution');
var startTime = new Date().getTime();
var endTime = new Date().getTime();

let pipeline = new Capu({ a: 1 }).once();

let test1 = pipeline
  .src('alizain', 'zee')
  .reduce(function test(files) {
    console.log(typeof files);
    return files;
  })
  .map(function test2(files) {
    console.log(files.size);
    endTime = new Date().getTime();
    console.log(endTime - startTime);
    return files;
  })
