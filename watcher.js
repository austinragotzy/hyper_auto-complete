const {
  removeDoubles,
  removeEmpty,
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

  /**
   *
   * @method Watcher._cleanCmdStr
   * @param  {Array} cmdArr
   * @return {Array}
   *
   */
  _cleanCmdStr(cmdArr) {
    const tempArr = [];
    cmdArr.forEach((val) => {
      const result = this._checkOkChars(val);
      if (result) {
        tempArr.push(val);
      }
    });
    return tempArr;
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
    cmdArr = this._cleanCmdStr(cmdArr);

    this.comStr = this.comStr.concat(cmdArr);
    this.line_x = this.comStr.length;
  }

  /**
   *
   * @method Watcher.afterPaste
   * @param  {String} cmdEnd
   * @return {Array}
   */
  afterPaste(cmdEnd) {
    let cmdArr = stringToArray(cmdEnd);
    cmdArr = this._cleanCmdStr(cmdArr);
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

      this.comStr = this._cleanCmdStr(this.comStr);
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
      this.comStr = this._cleanCmdStr(this.comStr);
      const cmdTrim = arrayToString(this.comStr);
      this.commandArr.push(cmdTrim.trim());
      // no empty commands
      this.commandArr = removeEmpty(this.commandArr);
      // .bash_history records two cmds in a row as one
      this.commandArr = removeDoubles(this.commandArr);
    }
    // reset all
    this.comStr = [];
    this.line_x = 0;
    this.arrowCnt = 0;
  }

  /**
   *
   * @method Watcher.ctrlDelete
   * @return {void}
   */
  ctrlDelete() {
    if (this.line_x < this.comStr.length) {
      const endSpaceIdx = this.comStr.length - 1;
      const hasEndSpace = this.comStr[endSpaceIdx] === ' ';

      const cmdBegin = this.comStr.slice(0, this.line_x);
      let cmdEnd = this.comStr.slice(this.line_x);

      cmdEnd = sliceFwdOnce(cmdEnd, hasEndSpace);

      this.line_x = cmdBegin.length;
      this.comStr = cmdBegin.concat(cmdEnd);
    }
  }

  /**
   *
   * @method Watcher.ctrlBackspace
   * @return {void}
   */
  ctrlBackspace() {
    if (this.line_x !== 0) {
      // cursor is at the end of array
      if (this.line_x === this.comStr.length) {
        this.comStr = sliceBkwOnce(this.comStr);
        this.line_x = this.comStr.length;
      // somewhere in the middle of the array
      } else if (this.line_x < this.comStr.length) {
        let cmdBegin = this.comStr.slice(0, this.line_x);
        const cmdEnd = this.comStr.slice(this.line_x);

        cmdBegin = sliceBkwOnce(cmdBegin);

        this.line_x = cmdBegin.length;
        this.comStr = cmdBegin.concat(cmdEnd);
      }
    }
  }

  /**
   *
   * @method Watcher.ctrlBackArrow
   * @return {void}
   */
  ctrlBackArrow() {
    if (this.line_x > 0) {
      let spaceIndex;
      const startIndex = this.line_x - 1;
      for (let i = startIndex; i >= 0; i--) {
        const ele = this.comStr[i];
        if (ele === ' ' && this.line_x > 0) {
          this.line_x--;
        } else {
          spaceIndex = this.comStr.lastIndexOf(' ', this.line_x - 1);
          break;
        }
      }
      if (spaceIndex >= 0) {
        this.line_x = spaceIndex + 1;
      } else {
        this.line_x = 0;
      }
    }
  }

  /**
   *
   * @method Watcher.ctrlForwardArrow
   * @return {void}
   */
  ctrlForwardArrow() {
    if (this.line_x < this.comStr.length) {
      let spaceIndex;
      const endIndex = this.comStr.length;
      for (let i = this.line_x; i < endIndex; i++) {
        const ele = this.comStr[i];
        if (ele === ' ' && this.line_x < this.comStr.length) {
          this.line_x++;
        } else {
          spaceIndex = this.comStr.indexOf(' ', this.line_x);
          break;
        }
      }
      if (spaceIndex >= 0) {
        this.line_x = spaceIndex;
      } else {
        this.line_x = this.comStr.length;
      }
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

  watchArrows(data, cmdHistory) {
    // UP/DOWN ARROWS
    if (data === '\x0d') { // enter after up or down
      this._afterUpDwn(cmdHistory);
      this._enterKey();
      this.arrowTrigger = false;
    } else if (data === '\x7f') { // backspace after up/down
      this._afterUpDwn(cmdHistory);
      this._backSpaceKey();
      this.arrowTrigger = false;
    } else if (data === '\x1b[C') { // right arrow up/down
      this._afterUpDwn(cmdHistory);
      if (this.comStr.length > this.line_x) {
        this.line_x++;
      }
      this.arrowTrigger = false;
    } else if (data === '\x1b[D') { // left arrow up/down
      this._afterUpDwn(cmdHistory);
      if (this.line_x > 0) {
        this.line_x--;
      }
      this.arrowTrigger = false;
    } else if (this._checkOkChars(data)) {
      this._afterUpDwn(cmdHistory);
      this.makeString(data);
      this.arrowTrigger = false;
    }
  }

  watchTab(data, pastCmds) {
    // TAB
    if (data === '\x0d') { // enter after tab
      this._afterTab(pastCmds);
      this._enterKey();
      this.tabTrigger = false;
    } else if (data === '\x7f') { // backspace after tab
      this._afterTab(pastCmds);
      this._backSpaceKey();
      this.tabTrigger = false;
    } else if (data === '\x1b[C') { // right arrow after tab
      this._afterTab(pastCmds);
      if (this.comStr.length > this.line_x) {
        this.line_x++;
      }
      this.tabTrigger = false;
    } else if (data === '\x1b[D') { // left arrow after tab
      this._afterTab(pastCmds);
      if (this.line_x > 0) {
        this.line_x--;
      }
      this.tabTrigger = false;
    } else if (this._checkOkChars(data)) {
      this._afterTab(pastCmds);
      this.makeString(data);
      this.tabTrigger = false;
    }
  }
}


module.exports = Watcher;
