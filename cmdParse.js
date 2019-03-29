const cp = require('child_process');
const helpParse = require('help-parser');

/**
   * @function
   * @param {String} command
   * @param {Array<String>} args
   * @returns {Promise<Object>}
   */
function cmdParser(command) {
  return new Promise((resolve, reject) => {
    const cmd = `${command} --help`;
    cp.exec(cmd, (err, stout, stin) => {
      if (err) {
        reject(err);
      }
      const helpObj = helpParse(stout, command);
      resolve(helpObj);
    });
  });
}

cmdParser('rm').then(help => console.log(help));
