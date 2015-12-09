/* eslint-disable */

let entry = capu.src('./index.html');
let assets1 = entry1.do(assets());

let js = assets1.do(split('.js', /\.js$/, '.jsx'));
let css = assets1.do(split('.css'));

let scss = capu.src('./scss/**/*.scss')
  .each(sass.process());

let imgs = capu.src();

postCss = css.src('./css/**/*.css', js.do(webpack.extractCSS()), scss)
  .do(minifyCSS());

let images = capu.src('./images/**/*.jpg', postCss.do(extractIMGs()));

let finalJs = js.do(minifyJS());

entry.watch();
scss.watch();
imgs.watch();

var img = [
  'img/**/*.jpg',
  'im'
]
