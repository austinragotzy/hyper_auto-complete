const fs = require('fs-extra');
const path = require('path');

/**
 *
 * @param  {Array} arr
 * @return {Array} array of vales, last item and current item unique
 */
const removeDoubles = (arr) => {
  const uniqArr = arr.filter((val, i, self) => val !== self[i + 1]);
  return uniqArr;
};

/**
 *
 * @param  {Array} arr
 * @return {Array} array of vales, last item and current item unique
 */
const removeEmpty = (arr) => {
  const nonEmptyArr = arr.filter(val => val !== '');
  return nonEmptyArr;
};

/**
 *
 * @function fetchCmds
 * @return {Array} array of strings of each command entered
 */
const fetchCmds = async () => {
  let cmdsArr;
  try {
    const commands = await fs.readFile(path.join(process.env.HOME, '.bash_history'), 'UTF-8');
    cmdsArr = commands.split('\n');
  } catch (err) {
    console.log(err);
  }
  return cmdsArr;
};

/**
 *
 * @function arrayToString
 * @param  {Array} arr
 * @return {String} string from array
 */
const arrayToString = arr => arr.join('');

/**
 *
 * @function stringToArray
 * @param  {String} str
 * @return {Array} array from string
 */
const stringToArray = str => str.split('');

/**
 *
 * @function sliceFwdOnce
 * @param  {Array} cmdArr
 * @param {Boolean} endSpace if space at end of array
 * @return {Array} array of string
 */
const sliceFwdOnce = (cmdArr, endSpace) => {
  let space = arrayToString(cmdArr);
  space = space.split(' ');
  const sizeOfSpaces = space.length;
  for (let i = 0; i < sizeOfSpaces; i++) {
    if (space[i] === '') {
      space.shift();
    } else {
      space.shift();
      break;
    }
  }
  space = space.join(' ');
  const tempArr = stringToArray(space);
  if (tempArr.length > 0 || endSpace) {
    tempArr.unshift(' ');
  }
  return tempArr;
};

/**
 *
 * @function sliceFwdOnce
 * @param  {Array} cmdArr
 * @return {Array} array of string
 */
const sliceBkwOnce = (cmdArr) => {
  let space = arrayToString(cmdArr);
  space = space.split(' ');
  for (let i = space.length - 1; i >= 0; i--) {
    if (space[i] === '') {
      space.pop();
    } else {
      space.pop();
      break;
    }
  }
  space = space.join(' ');
  const tempArr = stringToArray(space);
  if (tempArr.length > 0) {
    tempArr.push(' ');
  }
  return tempArr;
};

module.exports = {
  removeDoubles,
  removeEmpty,
  fetchCmds,
  stringToArray,
  arrayToString,
  sliceFwdOnce,
  sliceBkwOnce
};
