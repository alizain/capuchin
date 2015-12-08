let entry = capu.src('./index.html');
let assets1 = entry1.do(assets());

let js = assets1.do(split('.js', /\.js$/, '.jsx'));
let css = assets1.do(split('.css'));

let scss = capu.src('./scss/**/*.scss')
  .do(sass.process());

let bundle = webpack.bundle('./index.html');

let imgs = capu.src();

postCss = css.src('./css/**/*.css', js.do(webpack.extractCSS()), scss)
  .do(minifyCSS());

let images = capu.src('./images/**/*.jpg', postCss.do(extractIMGs()))
  .do(sourceMap())
  .do(bundle);

js.do(minifyJS())
  .do(sourceMap())
  .do(bundle);

entry.watch();
scss.watch();
imgs.watch();
