import { resolve } from 'path';
import { compare } from 'buffertools';
import { readFileSync } from 'graceful-fs';
import { randomBytes } from 'crypto';

export default class VF {

  constructor(path) {
    this.path = path;
    this.contents = randomBytes(256);
  }

}
