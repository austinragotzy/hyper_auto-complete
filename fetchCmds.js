const fs = require('fs-extra');
const path = require('path');


const sortCmds = (oldCmds, newCmds) => {
  const oldCnt = oldCmds.length;
  const newCnt = newCmds.length;
  const cmdArr = [];
  if (oldCnt !== newCnt) {
    for (let i = oldCnt; i < newCnt; i++) {
      const ele = newCmds[i];
      cmdArr.push(ele);
    }
  }
  return cmdArr;
};
/**
 *
 * @param  {Array} commands
 * @return {void}
 */
const saveCmds = async (commands) => {
  const commandsStr = commands.join('\n');
  try {
    await fs.outputFile(
      '/home/devinr/aprog/js/auto-complete/hyper_auto-complete/autoComp.txt', commandsStr,
      { flag: 'a' }
    );
  } catch (err) {
    console.log(err);
  }
};

const getCmds = async () => {
  try {
    const newCommands = await fs.readFile(path.join(process.env.HOME, '.bash_history'), 'UTF-8');
    const oldCommands = await fs.readFile('/home/devinr/aprog/js/auto-complete/hyper_auto-complete/autoComp.txt', 'UTF-8');
    const cmdsSave = sortCmds(oldCommands.split('\n'), newCommands.split('\n'));
    await saveCmds(cmdsSave);
    // const commands = newCommands.split('\n');
    // commands.forEach((e, i) => {
    //   console.log(e);
    // });
  } catch (err) {
    console.log(err);
  }
};


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

module.exports = fetchCmds;
