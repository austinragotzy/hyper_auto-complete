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
 * @param  {Array} arr
 * @return {String} string from array
 */
const arrayToString = arr => arr.join('');

/**
 *
 * @param  {String} str
 * @return {Array} array from string
 */
const stringToArray = str => str.split('');

module.exports = {
  removeDoubles,
  fetchCmds,
  stringToArray,
  arrayToString
};
