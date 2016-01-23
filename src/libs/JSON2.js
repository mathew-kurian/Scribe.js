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

export function stringify(obj, replacer, spaces) {
  return JSON.stringify(obj, (k, v)=> {
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
}