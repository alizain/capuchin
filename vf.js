import { resolve } from 'path';
import { compare } from 'buffertools';
import { readFileSync } from 'graceful-fs';
import { randomBytes } from 'crypto';

function VF(path) {
  this.path = path;
  this.contents = randomBytes(256);
  return this;
}

export default VF;
