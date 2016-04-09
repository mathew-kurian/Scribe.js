export function parse(str, reviver) {
  return JSON.parse(str, (k, v) => {
    let rv;
    if (typeof v === 'string') {
      if (/^Promise \{(.*?)}$/g.test(v)) {
        return new Promise((r, e) => 0);
      } else if (/^function ([a-zA-Z0-9_\$]*?)\((.*?)\)\s?\{(.*?)}$/g.test(rv = v.replace(/\n/g, ''))) {
        try {
          let x;
          eval(`x = ${v}`);
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

const stringifyOnce = function (obj, replacer, indent) {
  var printedObjects = [];
  var printedObjectKeys = [];

  function printOnceReplacer(key, value) {
    if (printedObjects.length > 2000) { // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
      return 'object too long';
    }
    var printedObjIndex = false;
    printedObjects.forEach(function (obj, index) {
      if (obj === value) {
        printedObjIndex = index;
      }
    });

    if (key == '') { //root element
      printedObjects.push(obj);
      printedObjectKeys.push("root");
      return value;
    }

    else if (printedObjIndex + "" != "false" && typeof(value) == "object") {
      if (printedObjectKeys[printedObjIndex] == "root") {
        return "(pointer to root)";
      } else {
        return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase() : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
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

  return JSON.stringify(obj, printOnceReplacer, indent);
};

// http://www.z-car.com/blog/programming/how-to-escape-mongo-keys-using-node-js-in-a-flash
function escapeKeys(obj) {
  if (!(Boolean(obj) && typeof obj == 'object'
    && Object.keys(obj).length > 0)) {
    return false;
  }

  Object.keys(obj).forEach(function (key) {
    if (typeof(obj[key]) == 'object') {
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

export function stringify(obj, replacer, spaces) {
  const objStr = stringifyOnce(obj, (k, v)=> {
    if (typeof v !== 'undefined' && v !== null) {
      if (typeof v.then === 'function') {
        return 'Promise { <pending> }'
      } else if (typeof v === 'function') {
        return v.toString().replace(/\[native code]/gm, '[native]');
      } else if (v instanceof RegExp) {
        return v.toString();
      }
    }

    return v;
  }, spaces);

  const objCpy = JSON.parse(objStr);

  escapeKeys(objCpy);

  return JSON.stringify(objCpy);
}