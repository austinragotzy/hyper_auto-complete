const { removeDoubles } = require('./utils');

/**
 *
 * @class AutoComp
 * @property commandArr
 */
class AutoComp {
  /**
   * Creates an instance of AutoComp.
   * @memberof AutoComp
   */
  constructor() {
    this.commandArr = [];
    this.comStr = [];
    this.line_x = 0;
    this.arrowCnt = 0;
    this.arrowTrigger = false;
    this.tabTrigger = false;
  }

  _afterTab(cmdEnd) {
    console.log(JSON.stringify(cmdEnd));
    const cmdArr = cmdEnd.split('');

    const tempArr = [];
    cmdArr.forEach((val, i) => {
      const result = /[^\x20-\x7E]+/g.test(val);
      if (!result) {
        tempArr.push(val);
      }
    });
    console.log(tempArr);
    console.log(JSON.stringify(this.comStr));
    this.comStr = this.comStr.concat(cmdArr);
    // console.log(this.comStr);
  }

  _getArrowCmd(pastCmds) {
    const arrowCmdCnt = this.commandArr.length - this.arrowCnt;
    let foundCmd;
    if (arrowCmdCnt < 0) {
      // last ele of pastCmds is blank \n
      const movesUp = ((this.arrowCnt - this.commandArr.length) + 1);
      const i = pastCmds.length - movesUp;
      foundCmd = pastCmds[i];
      console.log(foundCmd);
    } else {
      foundCmd = this.commandArr[arrowCmdCnt];
      console.log(foundCmd);
    }
    return foundCmd.split('');
  }

  _deleteKey() {
  // cursor is anywhere but end of array
    if (this.line_x < this.comStr.length) {
      this.comStr = this.comStr.slice(0, this.line_x)
        .concat(this.comStr.slice(this.line_x + 1));
    }
    const tempArr = [];
    this.comStr.forEach((val, i) => {
      const result = /[^\x20-\x7E]+/g.test(val);
      if (!result) {
        tempArr.push(val);
      }
    });
    this.comStr = tempArr;
  }

  _backSpaceKey() {
    // cant go into negative numbers so check
    if (this.line_x !== 0) {
      // cursor is at the end of array
      if (this.line_x === this.comStr.length) {
        this.comStr.pop();
        // somewhere in the middle of the array
      } else {
        this.comStr = this.comStr.slice(0, this.line_x - 1)
          .concat(this.comStr.slice(this.line_x));
      }
      this.line_x--;
    } // else at first element in array do nothing
  }

  _enterKey() {
    // array and clear the buffer string
    if (this.comStr.length !== 0) {
      this.commandArr.push(this.comStr.join(''));
      // .bash_history records two cmds in a row as one
      this.commandArr = removeDoubles(this.commandArr);
    }
    // reset all
    this.comStr = [];
    this.line_x = 0;
    this.arrowCnt = 0;
    console.log(this.commandArr);
  }

  // _cleanComStr(command) {
  //   // need to remove non writable chars then set this.line_x
  //   // const testStr = _currentCommand.replace(, '0');

  //   // \u001b[#P jumps # spaces back
  //   // \u001b[C moves cursor forward
  //   // \u00ib[K clears from cursor forward including cursor
  //   console.log(JSON.stringify(command));
  //   this.comStr = command.split(/(\u001b\[.P|\u001b\[K|\u001b\[C|\\b)/g);
  //   console.log(JSON.stringify(this.comStr));
  //   const tempArr = [];
  //   this.comStr.forEach((val, i) => {
  //     const result = /[^\x20-\x7E]+/g.test(val);
  //     if (!result) {
  //       // console.log(val);
  //       tempArr.push(val);
  //     } else {
  //       // console.log(JSON.stringify(val));
  //     }
  //   });

  //   this.comStr = tempArr;
  //   // console.log(this.comStr);
  // }

  /**
   *
   * @param  {String} data
   * @return {Boolean}
   * @memberof AutoComp
   */
  _checkForArrow(data) {
    if (data === '\x1b[A') {
      // up arrow
      this.arrowCnt++;
      if (this.arrowCnt > 0) {
        this.arrowTrigger = true;
      }
      return true;
    } if (data === '\x1b[B') {
      // down arrow
      this.arrowCnt--;
      if (this.arrowCnt > 0) {
        this.arrowTrigger = true;
      } else {
        this.arrowTrigger = false;
        this.comStr = [];
        this.line_x = 0;
      }
      return true;
    } if (data === '\x1b[C') {
      // right arrow
      if (this.comStr.length > this.line_x) { // check logic
        this.line_x++;
      }
      return true;
    } if (data === '\x1b[D') {
      // left arrow
      if (this.line_x > 0) {
        this.line_x--;
      }
      return true;
    }
    return false;
  }

  _checkForTab(data) {
    if (data === '\x09') {
      this.tabTrigger = true;
      return true;
    }
    return false;
  }

  _makeString(data) {
    // this method takes each character from the term input and creates a
    // string out of it and once the command is done it pushes it into an array
    if (data === '\x7f') { // if there is a back space delete it
      this._backSpaceKey();
    } else if (data === '\x0d') { // if enter is pressed push the string to an
      this._enterKey();
    } else { // otherwise keep adding to the buffer string
      if (this.line_x === this.comStr.length) {
        this.comStr.push(data);
      } else if (this.line_x <= 0) {
        this.comStr = [data].concat(this.comStr);
      } else {
        this.comStr = this.comStr.slice(0,
          this.line_x).concat([data]).concat(this.comStr.slice(this.line_x));
      }
      this.line_x++;
    }
  }

  _onArrow(data) {

  }

  _onTab(data) {

  }

  _onPaste(data, pastCmd) {

  }
}


module.exports = AutoComp;
