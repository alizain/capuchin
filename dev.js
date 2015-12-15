import Capu from './capu.js';

console.log('starting execution');
var startTime = new Date().getTime();
var endTime = new Date().getTime();

let pipeline = new Capu({ a: 1 });

let test1 = pipeline
  .next(null)
  .src('alizain', 'zee')
  .next(null, function one(files) {
    console.log('yaaay, reduce being run');
    return files;
  })
  .next(null, function two(files) {
    return new Promise(function(resolve, reject) {
      console.log('yahooo, map being run');
      console.log(files);
      endTime = new Date().getTime();
      console.log(endTime - startTime);
      setImmediate(function() {
        resolve(files);
      }, 0);
    });
  })
  .next(null, function three(files) {
    console.log('i should not get run!');
  });

pipeline.once();
