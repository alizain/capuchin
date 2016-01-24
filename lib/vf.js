import fs from 'fs';
import { dirname, resolve } from 'path';

function VF(path) {
  let callee = dirname(process.argv[process.argv.length - 1])
  this.path = resolve(callee, path);
  this.contents = fs.readFileSync(this.path);
  return this;
}

export default VF;
