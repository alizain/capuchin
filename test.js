import Capu from './capu.js';

console.log('starting execution');
var startTime = new Date().getTime();
var endTime = new Date().getTime();

let pipeline = new Capu({ a: 1 });

let test1 = pipeline
  // .next(null)
  // .next(null, function(files) {
  //   console.log('yaaay, one being run', files);
  //   return files;
  // })
  .src('alizain', 'zee')
  .next(null, function(files) {
    console.log('yaaay, two being run', files);
    return files;
  })
  .src('f')
  .next(null, function(files) {
    return files;
  })

pipeline.once();
