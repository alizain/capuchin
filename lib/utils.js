import chalk from 'chalk';
const allowedColors = [
  'blue',
  'magenta',
  'cyan',
  'yellow'
];

export function* generateSequence(i) {
  let init = isNaN(i) ? 0 : i;
  while (true) { // eslint-disable-line
    yield init += 1;
  }
}

export function time() {
  let d = new Date();
  return [
    '[',
    chalk.grey([
      d.getUTCHours(),
      ':',
      d.getUTCMinutes(),
      ':',
      d.getUTCSeconds()
    ].join('')),
    ']'
  ].join('');
}

export function logger(id, ...args) {
  let color = chalk.white;
  let pre = id;
  if (!isNaN(id)) {
    color = chalk[allowedColors[id % allowedColors.length]];
    pre = '#' + id;
  }
  console.log( // eslint-disable-line
    time(),
    color(pre),
    ...args
  );
}

logger.success = function(...args) {
  let colored = args.map((msg) => {
    return typeof msg === 'string' ? chalk.green(msg) : msg;
  });
  console.log( // eslint-disable-line
    time(),
    ...colored
  );
};
