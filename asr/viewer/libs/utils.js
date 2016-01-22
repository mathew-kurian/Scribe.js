import ReactPrefixr from 'react-prefixr'

export function ifcat(base, obj) {
  let res = '';
  if (arguments.length > 1) {
    res = base + '';
  } else {
    obj = base;
  }
  for (let [cls, pred] of Object.entries(obj)) {
    if (pred) res += ' ' + cls;
  }

  return res;
}

export function ifel(predicate, b, c) {
  return !!predicate ? b : c;
}

export function pre(o) {
  return ReactPrefixr(o);
}

export function apply(elem, styles) {
  for (let [prop,val] of Object.entries(styles)) {
    elem.style[prop] = val;
  }
}