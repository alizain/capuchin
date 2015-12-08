import File from './file';
import { Stats } from 'fs';
import chokidar from 'chokidar';
import { resolve } from 'path';

const connector = Symbol('connector');
const watch = Symbol('watch');
const start = Symbol('run');
const run = Symbol('run');

class Capuchin {

  constructor() {
    this.in = new Map();
    this.out = new Map();
    this.transforms = new Set();
    this.children = new Set();
  }

  src(...sources) {
    sources.forEach((source) => {
      if (typeof source === 'string') {
        chokidar.watch(source, {
          persistent: false,
          alwaysStat: true
        }).on('ready', this[run].bind(this, this.transforms))
          .on('add', this[watch].bind(this))
          .on('change', this[watch].bind(this))
          .on('unlink', this[watch].bind(this));
      } else if (typeof source[connector] === 'function') {
        // we found a parent of ours, hooorayy!
      }
    });
    return this;
  }

  [start]() {

  }

  [run](transforms, ...args) {
    console.log('yahoo');
    console.log(args);
    // Promise.all(this.in.values())
    //   .then(() => {});
  }

  [watch](p, obj) {
    const path = resolve(p);
    if (obj && obj instanceof Stats && obj.isFile()) {
      if (!this.in.has(path) || this.in.get(path).mtime < obj.mtime) {
        this.in.set(path, new File(path, null, obj));
        this[run](); // start transform pipeline here
      }
    }
  }

  [connector]() {
    // we'll do something here for our child;
  }

  * [Symbol.iterator]() {
    yield *this.out.values();
  }

}

new Capuchin().src('./samples/a/**/*.js', './samples/b/**/*.js');

// function src(...files) {
//
//   this.seen =
//
// }
