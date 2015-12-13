'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Capu = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _file = require('./file');

var _file2 = _interopRequireDefault(_file);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_bluebird2.default.onPossiblyUnhandledRejection(function (err) {
  throw err;
});

var RUN = Symbol('run');
var RUN_CHILDREN = Symbol('run_children');
var RUN_TRANSFORM = Symbol('run_transform');
var SRC_FUNC = Symbol('src');
var MAP_FUNC = Symbol('map');
var REDUCE_FUNC = Symbol('reduce');

var sequence = (0, _utils.generateSequence)(0);

var Capu = exports.Capu = (function () {
  function Capu(opts, type, transform) {
    var _this = this;

    _classCallCheck(this, Capu);

    this.id = sequence.next().value;
    this.opts = opts;
    this.type = type || SRC_FUNC;
    this.transform = transform || _utils.noop;
    this.children = new Array();
    this.inputs = new Map();
    this.output = new Map();

    for (var _len = arguments.length, sources = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      sources[_key - 3] = arguments[_key];
    }

    sources.forEach(function (src) {
      if (typeof src === 'string') {
        _this.inputs.set(src, new _file2.default(src));
      } else if (Array.isArray(src)) {
        // assume array of glob paths
      } else if (src instanceof Capu) {
          src.dep(_this);
        }
    });
    // this[RUN](Promise.resolve(this.inputs));
  }

  _createClass(Capu, [{
    key: RUN,
    value: function value(newInput) {
      var _this2 = this;

      this.log('running');
      if (this.type === SRC_FUNC) {
        return this[RUN_CHILDREN](newInput);
      }
      this.log('checking for data integrity');
      if (!(newInput instanceof Map)) {
        throw new Error('only Maps can be passed around');
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = newInput[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2);

          var path = _step$value[0];
          var vf = _step$value[1];

          if (!(vf instanceof _file2.default)) {
            throw new Error('only VF instances allowed');
          }
          this.inputs.set(path, vf);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var rootP = undefined;
      if (this.type === REDUCE_FUNC) {
        this.log('running reduce transformation');
        rootP = Capu[RUN_TRANSFORM](this.transform, this.inputs);
      } else if (this.type === MAP_FUNC) {
        (function () {
          _this2.log('running map transformation');
          var pArray = [];
          newInput.forEach(function (path, vf) {
            pArray.push(Capu[RUN_TRANSFORM](_this2.transform, path, vf));
          });
          rootP = _bluebird2.default.all(pArray);
        })();
      }
      return rootP.then(function (data) {
        _this2.out = data;
        return _this2[RUN_CHILDREN](data);
      });
    }
  }, {
    key: RUN_CHILDREN,
    value: function value(data) {
      var _this3 = this;

      if (this.children.length <= 0) {
        return data;
      }
      this.log('running children');
      var p = data;
      if (!(data instanceof _bluebird2.default)) {
        p = _bluebird2.default.resolve(data);
      }
      return p.then(function (d) {
        var pArray = _this3.children.map(function (func) {
          return func[RUN](d);
        });
        return _bluebird2.default.all(pArray);
      });
    }
  }, {
    key: 'dep',
    value: function dep(func) {
      this.log('adding children');
      this.children.push(func);
    }
  }, {
    key: 'src',
    value: function src() {
      this.log('adding sources');

      for (var _len2 = arguments.length, sources = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        sources[_key2] = arguments[_key2];
      }

      return new (Function.prototype.bind.apply(Capu, [null].concat([this.opts, SRC_FUNC, _utils.noop, this], sources)))();
    }
  }, {
    key: 'reduce',
    value: function reduce(func) {
      this.log('adding reducer');
      return new Capu(this.opts, REDUCE_FUNC, func, this);
    }
  }, {
    key: 'map',
    value: function map(func) {
      this.log('adding mapper');
      return new Capu(this.opts, MAP_FUNC, func, this);
    }
  }, {
    key: 'log',
    value: function log() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      _utils.logger.apply(undefined, [this.id].concat(args));
    }
  }, {
    key: 'once',
    value: function once() {
      setImmediate((function wait() {
        this[RUN](this.inputs);
      }).bind(this), 0);
      return this;
    }
  }], [{
    key: RUN_TRANSFORM,
    value: function value(func, data) {
      var result = func(data);
      if (result instanceof Error) {
        throw result;
      } else if (!(result instanceof _bluebird2.default)) {
        result = _bluebird2.default.resolve(result);
      }
      return result;
    }
  }]);

  return Capu;
})();

var pipeline = new Capu({ a: 1 }).once();

var test1 = pipeline.src('alizain', 'zee').reduce(function test(files) {
  console.log(typeof files === 'undefined' ? 'undefined' : _typeof(files));
  return files;
}).map(function test2(files) {
  console.log(files.size);
  return files;
});
