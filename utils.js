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
 * @param  {String} str
 * @param {Number} x line_x
 * @param {Number} index index of next space char
 * @return {Array} array of string
 */
const sliceFwdOnce = (str, x, index) => {
  let tempStr;
  if (index < 0) {
    tempStr = str.slice(0, x - 1);
  } else {
    tempStr = str.slice(0, x - 1).concat(str.slice(index));
  }
  return tempStr;
};

/**
 *
 * @function sliceFwdOnce
 * @param  {String} str
 * @param {Number} x line_x
 * @param {Number} index index of next space char
 * @return {Array} array of string
 */
const sliceBkwOnce = (str, x, index) => {
  let tempStr;
  if (index < 0) {
    tempStr = str.slice(0, x - 1);
  } else {
    tempStr = str.slice(0, x - 1).concat(str.slice(index));
  }
  return tempStr;
};

module.exports = {
  removeDoubles,
  fetchCmds,
  stringToArray,
  arrayToString,
  sliceFwdOnce,
  sliceBkwOnce
};
