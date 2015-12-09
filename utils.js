import chalk from 'chalk';
const allowedColors = [
  'blue',
  'magenta',
  'cyan'
];

export function* generateSequence(i) {
  let init = isNaN(i) ? 0 : i;
  while (true) { // eslint-disable-line
    yield init += 1;
  }
}

export function noop(data) {
  return data;
}

export function logger(id, ...args) {
  let color = chalk[allowedColors[id % 3]];
  let d = new Date();
  console.log( // eslint-disable-line
    [
      '[',
      chalk.grey([
        d.getUTCHours(),
        ':',
        d.getUTCMinutes(),
        ':',
        d.getUTCSeconds()
      ].join('')),
      ']'
    ].join(''),
    color([
      '#',
      id
    ].join('')),
    ...args
  );
}
