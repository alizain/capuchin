import { resolve } from 'path';
import { compare } from 'buffertools';
import { readFileSync } from 'graceful-fs';

export default class File {

  constructor(p, contents, stats) {
    this.path = resolve(p);
    if (!contents || !(contents instanceof Buffer)) {
      this.contents = readFileSync(this.path);
    }
    this.mtime = stats.mtime;
  }

  equals(other) {
    return compare(this.contents, other.content) === 0;
  }

}
