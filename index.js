import File from './file';
import { Stats } from 'fs';
import chokidar from 'chokidar';
import { resolve } from 'path';

const connector = Symbol('connector');
const watch = Symbol('watch');
const start = Symbol('run');
const run = Symbol('run');

const initial = Symbol('initial');
const final = Symbol('output');
const children = Symbol('children');
const transforms = Symbol('transforms');

class Capuchin {

  constructor() {
    this[initial] = new Map();
    this[final] = new Map();
    this[transforms] = new Set();
    this[children] = new Set();
  }

  src(...sources) {
    sources.forEach((source) => {
      if (typeof source === 'string') {
        chokidar.watch(source, {
          persistent: false,
          alwaysStat: true
        }).on('ready', this[run].bind(this, this[transforms]))
          .on('add', this[watch].bind(this))
          .on('change', this[watch].bind(this))
          .on('unlink', this[watch].bind(this));
      } else if (typeof source[connector] === 'function') {
        // we found a parent of ours, hooorayy!
      }
    });
    return this;
  }

  run(func) {
    this[transforms].add(func);
  }

  [run](map) {
    let chain = Promise.resolve(map);
    this[transforms].forEach((func) {
      chain = chain.then(func);
    });
    chain.catch((err) => {
      console.log('ooops');
    });
    chain.done((final) => {
      console.log('yaaaayyy!');
    });
  }

  [watch](e, p, obj) {
    const path = resolve(p);
    if (obj && obj instanceof Stats && obj.isFile()) {
      if (!this[initial].has(path) || this[initial].get(path).mtime < obj.mtime) {
        this[initial].set(path, new File(path, null, obj));
        this[run](); // start transform pipeline here
      }
    }
  }

  [connector]() {
    // we'll do something here for our child;
  }

  * [Symbol.iterator]() {
    yield *this[final].values();
  }

}

new Capuchin().src('./samples/a/**/*.js', './samples/b/**/*.js');

// function src(...files) {
//
//   this.seen =
//
// }
