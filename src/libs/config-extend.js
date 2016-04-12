import _ from 'lodash';

export default function extend(...args) {
  return _.mergeWith(...args, (obj, src) => Array.isArray(src) ? src : undefined)
}