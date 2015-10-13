
import _ from 'lodash';

export function extendImmutable() {
  return _.chain(arguments).toArray().reduce((extended, val) => {
    return _.merge(extended, val);
  }, {}).value();
}

export function randomId() {
  return Math.floor(Math.random() * 900 + 100);
}

export function allIndexOf(array, element) {
  return array.reduce((acc, el, index) => {
    if (el === element) {
      return acc.concat(index);
    }

    return acc;
  }, []);
}

export function insertOn(array, elements, position) {
  const pos = position ? position : array.length;

  return array.slice(0, pos).concat(
    elements instanceof Array ? elements : [elements]
  ).concat(array.slice(pos + 1, array.length));
}

export function removeFrom(array, position) {
  return array.slice(0, position).concat(array.slice(position + 1));
}

export function updateOn(array, position, newVal) {
  return insertOn(removeFrom(array, position), newVal, position);
}

export default {
  extendImmutable,
  randomId,
  allIndexOf,
  insertOn,
  removeFrom,
  updateOn,
};
