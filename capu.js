import Promise from 'bluebird';
import VF from './vf';
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

const SEQUENCER = generateSequence(0);

function Capu(opts, transform, ...sources) {
  this.id = SEQUENCER.next().value;
  this.log('doing setup');
  this.opts = opts || {};
  this.transform = transform;
  this.children = new Array();
  this.inputs = new Map();
  this.outputs = new Map();
  this[INITIALIZE](sources);
  return this;
}

Capu.prototype[INITIALIZE] = function(sources) {
  this.log('adding sources');
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
  this.log('running');
  if (newInput instanceof Map) {
    // run diff and figure out how much has changed
    for (let [path, vf] of newInput) {
      if (!(vf instanceof VF)) {
        throw new Error('only VF instances allowed');
      }
      this.inputs.set(path, vf);
    }
    // if nothing has changed, then we don't need to run
  }
  let rootP;
  if (typeof this.transform === 'function') {
    this.log('running transformation');
    rootP = this.transform(this.inputs);
  } else {
    rootP = this.inputs;
  }
  if (!(rootP instanceof Promise)) {
    rootP = Promise.resolve(rootP);
  }
  rootP = rootP.then((outputs) => {
    this.log('checking for data integrity');
    if (!(outputs instanceof Map)) {
      throw new Error('only Maps can be passed around');
    }
    this.log('saving outputs from transformation');
    // calculate diff between old output & new output
    this.outputs = outputs;
    // send only new output back
    return outputs;
  });
  if (this.children.length > 0) {
    rootP = rootP.then((outputs) => {
      this.log('running children');
      let pArray = this.children.map((child) => {
        return child[RUN](outputs);
      });
      return Promise.all(pArray).then(() => outputs);
    });
  }
  return rootP;
};

Capu.prototype.dep = function(func) {
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
      .then(function() {
        logger.success('DONE');
      }, function(err) {
        throw err;
      });
  }, 0);
  return this;
};

export default Capu;
