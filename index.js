import glob from 'glob';

const connector = Symbol('connector');

class Capuchin {

  constructor() {
    this.in = new Map();
    this.transforms = new Set();
    this.out = new Map();
    this.children = new Set();
  }

  src(...sources) {
    sources.forEach((src) => {
      if (typeof source === 'string') {
        glob.sync(source).forEach((f) => {
          console.log(f);
        });
      } else if (typeof source[connector] === 'function') {
        // we found a parent of ours, hooorayy!
      }
    });
    return this;
  }

  [connector]() {
    // we'll do something here for the parent;
  }

  * [Symbol.iterator]() {
    yield *this.out.values();
  }

}

new Capuchin().src('./**/*.js');

// function src(...files) {
//
//   this.seen =
//
// }
