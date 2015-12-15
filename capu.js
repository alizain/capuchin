import Promise from 'bluebird';
import VF from './file';
import {
  generateSequence,
  logger
} from './utils';

// Promise.onPossiblyUnhandledRejection((err) => {
//   console.log('unhandled!!!!');
//   throw err;
// });

const INITIALIZE = Symbol();

const RUN = Symbol();
const RUN_CHILDREN = Symbol();
const RUN_TRANSFORM = Symbol();

const SEQUENCER = generateSequence(0);

function Capu(opts, transform, ...sources) {
  this.id = SEQUENCER.next().value;
  this.log('hello', opts, transform);
  this.opts = opts || {};
  this.transform = transform;
  this.children = new Array();
  this.inputs = new Map();
  this.outputs = new Map();
  this[INITIALIZE](sources);
  return this;
}

Capu.prototype[INITIALIZE] = function(sources) {
  sources.forEach((src) => {
    if (typeof src === 'string') {
      this.inputs.set(src, new VF(src));
    } else if (Array.isArray(src)) {
      // assume array of glob paths
    } else if (src instanceof Capu) {
      src.dep(this);
    }
  });
};

Capu.prototype[RUN] = function(newInput) {
  let rootP = new Promise((resolve, reject) => {
    this.log('running');
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
    let p;
    if (typeof this.transform === 'function') {
      this.log('running transformation');
      p = this.transform(this.inputs);
    } else {
      p = this.inputs;
    }
    if (!(rootP instanceof Promise)) {
      p = Promise.resolve(p);
    }
    p = rootP.then((outputs) => {
      this.log('saving outputs from transformation');
      this.outputs = outputs;
      return this.outputs;
      return resolve(this.outputs);
    });
    if (this.children.length > 0) {
      rootP = rootP.then((outputs) => {
        this.log('running children');
        let pArray = this.children.map((child) => {
          return child[RUN](outputs);
        });
        return Promise.all(pArray);
      }, reject);
    }
    return rootP.then(resolve, reject);
  });
};

Capu.prototype[RUN_CHILDREN] = function(data) {
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
};

Capu.prototype[RUN_TRANSFORM] = function(func, data) {
  let result = func(data);
  if (result instanceof Error) {
    throw result;
  } else if (!(result instanceof Promise)) {
    result = Promise.resolve(result);
  }
  return result;
};

Capu.prototype.dep = function(func) {
  this.log('i\'m a dependancy for ' + func.id);
  this.children.push(func);
};

Capu.prototype.src = function(...sources) {
  return new Capu(this.opts, undefined, this, ...sources);
};

Capu.prototype.next = function(newOpts, func, ...sources) {
  let opts = Object.assign({}, this.opts, newOpts);
  return new Capu(opts, func, this, ...sources);
};

Capu.prototype.log = function(...args) {
  logger(this.id, ...args);
};

Capu.prototype.once = function() {
  setImmediate(() => {
    this[RUN](this.inputs)
      .then(function(res) {
        console.log('DONE!!!', res);
      }, function(err) {
        console.log('CATCH!!!', err);
        throw err;
      });
  }, 0);
  return this;
};

export default Capu;
