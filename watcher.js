const {
  removeDoubles,
  stringToArray,
  arrayToString,
  sliceFwdOnce,
  sliceBkwOnce
} = require('./utils');

/**
 *
 * @class Watcher
 * @property commandArr
 */
class Watcher {
  /**
   * Creates an instance of Watcher.
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

  /**
   *
   * @param  {String} data
   * @return {Boolean}
   * @memberof Watcher
   */
  _checkOkChars(data) {
    const uniCodeVal = data.charCodeAt(0);
    if (uniCodeVal > 31 && uniCodeVal < 127) {
      return true;
    }
    return false;
  }

  _cleanCmdStr() {
    const tempArr = [];
    this.comStr.forEach((val) => {
      const result = this._checkOkChars(val);
      if (result) {
        tempArr.push(val);
      }
    });
    this.comStr = tempArr;
  }

  /**
   *
   * @method Watcher.checkForArrow
   * @param  {String} data
   * @return {Boolean}
   * @memberof Watcher
   */
  checkForArrow(data) {
    if (data === '\x1b[A') {
      // up arrow
      this.arrowCnt++;
      if (this.arrowCnt > 0) {
        this.arrowTrigger = true;
      }
      return true;
    } if (data === '\x1b[B') {
      // down arrow
      if (this.arrowCnt > 0) {
        this.arrowCnt--;
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

  /**
   *
   * @method Watcher.checkForTab
   * @param  {any} data
   * @return {Boolean}
   *
   */
  checkForTab(data) {
    if (data === '\x09') {
      this.tabTrigger = true;
      return true;
    }
    return false;
  }

  /**
   *
   * @method Watcher._afterTab
   * @param  {String} cmdEnd
   * @return {Array}
   */
  _afterTab(cmdEnd) {
    let cmdArr = stringToArray(cmdEnd);

    if (cmdArr.includes('\u0007')) {
      cmdArr.shift();
    }
    if (cmdArr.includes('\r')) {
      const i = cmdArr.indexOf('\r');
      cmdArr = cmdArr.slice(0, i);
    }

    this.comStr = this.comStr.concat(cmdArr);
    this.line_x = this.comStr.length;
  }

  /**
   *
   * @method Watcher._afterPaste
   * @param  {String} cmdEnd
   * @return {Array}
   */
  _afterPaste(cmdEnd) {
    const cmdArr = stringToArray(cmdEnd);
    this.comStr = this.comStr.concat(cmdArr);
    this.line_x = this.comStr.length;
  }

  /**
   *
   * @method Watcher._afterUpDwn
   * @param  {Array} pastCmds
   * @return {Array}
   */
  _afterUpDwn(pastCmds) {
    const arrowCmdCnt = this.commandArr.length - this.arrowCnt;
    let foundCmd;
    if (arrowCmdCnt < 0) {
      // last ele of pastCmds is blank \n
      const movesUp = ((this.arrowCnt - this.commandArr.length) + 1);
      const i = pastCmds.length - movesUp;
      foundCmd = pastCmds[i];
    } else {
      foundCmd = this.commandArr[arrowCmdCnt];
    }
    this.comStr = stringToArray(foundCmd);
    this.line_x = this.comStr.length;
  }

  _deleteKey() {
  // cursor is anywhere but end of array
    if (this.line_x < this.comStr.length) {
      this.comStr = this.comStr.slice(0, this.line_x)
        .concat(this.comStr.slice(this.line_x + 1));

      this._cleanCmdStr();
    }
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
      // check for control seq chars
      this._cleanCmdStr();
      this.commandArr.push(arrayToString(this.comStr));
      // .bash_history records two cmds in a row as one
      this.commandArr = removeDoubles(this.commandArr);
    }
    // reset all
    this.comStr = [];
    this.line_x = 0;
    this.arrowCnt = 0;
    console.log(this.commandArr);
  }

  _ctrlDelete(delArr) {
    const spIdx = [];
    this.comStr.forEach((ele, i) => {
      if (ele === ' ') {
        spIdx.push(i);
      }
    });

    let s;
    if (this.line_x < this.comStr.length) {
      if (spIdx.length >= delArr.length) {
        delArr.forEach((val, i) => {
          s = this.comStr.indexOf(' ', this.line_x);
          this.comStr = sliceFwdOnce(this.comStr, this.line_x, s);
        });
      } else {
        this.comStr = this.comStr.slice(0, this.line_x - 1);
      }
    }
  }

  _ctrlBackspace(delArr) {
    const spaceIndex = [];
    for (let i = this.line_x - 1; i >= 0; i--) {
      const ele = this.comStr[i];
      if (ele === ' ') {
        spaceIndex.push(i);
      }
    }

    let sliceNum;
    let newArr;
    let s;
    if (this.line_x !== 0) {
      // cursor is at the end of array
      if (this.line_x === this.comStr.length) {
        if (delArr.length === spaceIndex.length) {
          sliceNum = spaceIndex.length - 1;
          newArr = this.comStr.slice(0, spaceIndex[sliceNum]);
          newArr.push(' ');
        } else if (spaceIndex.length > delArr.length) {
          sliceNum = 0;
          newArr = this.comStr.slice(0, spaceIndex[sliceNum]);
          newArr.push(' ');
        } else {
          newArr = [];
        }
        // somewhere in the middle of the array
      } else if (this.line_x < this.comStr.length) {
        if (delArr.length === spaceIndex.length) {
          s = this.comStr.lastIndexOf(' ', this.line_x - 1);
          newArr = this.comStr.slice(0, s + 1)
            .concat(this.comStr.slice(this.line_x - 1));
        } else if (spaceIndex.length > delArr.length) {
          s = this.comStr.lastIndexOf(' ', this.line_x - 1);
          newArr = this.comStr.slice(0, s + 1)
            .concat(this.comStr.slice(this.line_x - 1));
        } else {
          s = this.comStr.lastIndexOf(' ', this.line_x - 1);
          newArr = this.comStr.slice(this.line_x - 1);
        }
      }
      this.comStr = newArr;
      this.line_x = this.comStr.length;
    }
  }

  /**
   *
   * @method Watcher.makeString
   * @param  {String} data
   * @return {void}
   */
  makeString(data) {
    // this method takes each character from the term input and creates a
    // string out of it and once the command is done it pushes it into an array
    if (data === '\x7f') { // if there is a back space delete it
      this._backSpaceKey();
    } else if (data === '\x0d') { // if enter is pressed push the string to an
      this._enterKey();
    } else if (data === '\u001b[3~') { // if delete
      this._deleteKey();
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
}


module.exports = Watcher;
