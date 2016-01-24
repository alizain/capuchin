import VF from '../lib/vf';

export function scripts(...match) {

  return function transform(files) {

    console.log(files);

    let assets = [];

    files.forEach(() => {

    });

    return files;

  };

}

export function stylesheets(...match) {

  return function transform(files) {

  };

}

export default {
  scripts,
  stylesheets
};
