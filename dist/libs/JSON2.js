'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.parse = parse;
exports.stringify = stringify;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(str, reviver) {
  return JSON.parse(str, function (k, v) {
    var rv = void 0;
    if (typeof v === 'string') {
      if (/^Promise \{(.*?)}$/g.test(v)) {
        return new _promise2.default(function (r, e) {
          return 0;
        });
      } else if (/^function ([a-zA-Z0-9_\$]*?)\((.*?)\)\s?\{(.*?)}$/g.test(rv = v.replace(/\n/g, ''))) {
        try {
          var x = void 0;
          eval('x = ' + v);
          if (x) {
            return x;
          }
        } catch (e) {
          // ignore
        }
      }

      try {
        if ((rv = new RegExp(v)).toString() === v) {
          return rv;
        }
      } catch (e) {
        // ignore
      }
    }

    return v;
  });
}

var stringifyOnce = function stringifyOnce(obj, replacer, indent) {
  var printedObjects = [];
  var printedObjectKeys = [];

  function printOnceReplacer(key, value) {
    if (printedObjects.length > 2000) {
      // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
      return 'object too long';
    }
    var printedObjIndex = false;
    printedObjects.forEach(function (obj, index) {
      if (obj === value) {
        printedObjIndex = index;
      }
    });

    if (key == '') {
      //root element
      printedObjects.push(obj);
      printedObjectKeys.push("root");
      return value;
    } else if (printedObjIndex + "" != "false" && (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) == "object") {
      if (printedObjectKeys[printedObjIndex] == "root") {
        return "(pointer to root)";
      } else {
        return "(see " + (!!value && !!value.constructor ? value.constructor.name.toLowerCase() : typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
      }
    } else {

      var qualifiedKey = key || "(empty key)";
      printedObjects.push(value);
      printedObjectKeys.push(qualifiedKey);
      if (replacer) {
        return replacer(key, value);
      } else {
        return value;
      }
    }
  }

  return (0, _stringify2.default)(obj, printOnceReplacer, indent);
};

// http://www.z-car.com/blog/programming/how-to-escape-mongo-keys-using-node-js-in-a-flash
function escapeKeys(obj) {
  if (!(Boolean(obj) && (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) == 'object' && (0, _keys2.default)(obj).length > 0)) {
    return false;
  }

  (0, _keys2.default)(obj).forEach(function (key) {
    if ((0, _typeof3.default)(obj[key]) == 'object') {
      escapeKeys(obj[key]);
    } else {
      if (key.indexOf('.') !== -1) {
        var newkey = key.replace(/\./g, '_dot_');
        obj[newkey] = obj[key];
        delete obj[key];
      }
      if (key.indexOf('$') !== -1) {
        var newkey = key.replace(/\$/g, '_amp_');
        obj[newkey] = obj[key];
        delete obj[key];
      }
    }
  });

  return true;
}

function stringify(obj, replacer, spaces) {
  var objStr = stringifyOnce(obj, function (k, v) {
    if (typeof v !== 'undefined' && v !== null) {
      if (typeof v.then === 'function') {
        return 'Promise { <pending> }';
      } else if (typeof v === 'function') {
        return v.toString().replace(/\[native code]/gm, '[native]');
      } else if (v instanceof RegExp) {
        return v.toString();
      }
    }

    return v;
  }, spaces);

  var objCpy = JSON.parse(objStr);

  escapeKeys(objCpy);

  return (0, _stringify2.default)(objCpy);
}
