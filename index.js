import VF from './file';

const NOOP = Symbol('noop');

class Capuchin {

  constructor(opts, type, transform, ...sources) {
    this.transform = transform;
    this.children = new Set();
    this.in = new Map();
    this.out = new Map();
    sources.forEach((src) => {
      if (typeof src === 'string') {
        this.in.set(src, new VF(src));
      } else if (src instanceof Capuchin) {
        for (let [k, v] of src) {
          this.in.set(k, v);
        }
        src.dep(this.run);
      }
    });
    // this.run(Promise.resolve(this.in));
  }

  run(input) {
    return Promise.resolve(input)
      .then((data) => {
        if(this.transform !== NOOP)
        let p = this.transform(data);
        if (!(p instanceof Promise)) {
          p = Promise.resolve(p);
        }
        return p;
      })
      .then((data) => this.out = data);
  }

  dep(func) {
    this.children.add(func);
  }

  src(...sources) {
    return new Capuchin(this.opts, this.type, NOOP, this.in, ...sources);
  }

  next(func) {
    return new Capuchin(this.opts, this.type, func, this.in);
  }

  *[Symbol.iterator]() {
    yield *this.out;
  }

}
