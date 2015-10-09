
import _ from 'lodash';

export function extendImmutable() {
  return _.chain(arguments).toArray().reduce(function(extended, val) {
    return _.merge(extended, val);
  }, {}).value()
}

export function randomId() {
  return Math.floor(Math.random() * 900 + 100);
}

export function allIndexOf(array, element) {
    return array.reduce(function(acc, el, index) {
      if (el === element) {
        return acc.concat(index);
      }

      return acc;
    }, []);
}

export function insertOn(array, elements, position) {
  let returnedArray = array.slice(0);

  if(!position) {
    position = array.length;
  }

  return array.slice(0, position).concat(
    elements instanceof Array ? elements [elements] : []
  ).concat(array.slice(position + 1));
}

export function removeFrom(array, position) {
  return array.slice(0, position).concat(array.slice(position + 1));
}

export function updateOn(array, position, newVal) {
  return removeFrom(array, position)
}
