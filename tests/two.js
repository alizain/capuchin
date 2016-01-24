import Capu from '../capu.js';
import assets from '../plugins/assets';

let pipeline = new Capu({ a: 1 });

pipeline
  .src('./mockup/index.html')
  .next(null, assets.scripts())
  .next(null, function(files) {
    return files;
  });

pipeline.once();
