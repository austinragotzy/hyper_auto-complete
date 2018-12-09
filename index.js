const fs = require('fs-extra');
const Watcher = require('./watcher');
const { fetchCmds } = require('./utils');

// grab cmd from arrows, tab and paste then use on next input
let _pastCommand;
// array from .bash_history
let _commandHistory;
// paste is a UI_COMMAND_EXEC event
let _didPaste = false;
let _didCtrlDel = false;
let _ctrlDelArr = [];
let _didCtrlBckSpc = false;
let _ctrlBckArr = [];
let _didMoveFwd = false;
let _moveFwdArr = [];
let _didMoveBck = false;
let _moveBckArr = [];

exports.middleware = store => next => (action) => {
  // add if UI_COMMAND_EXEC and then add data has paste
  // command exec is editor:paste
  if (action.type === 'INIT') {
    store.dispatch({
      type: 'AUTO_COMPLETE',
      async effect() {
        _commandHistory = await fetchCmds();
      }
    });
    next(action);
  } else if (action.type === 'SESSION_ADD_DATA') {
    const { data } = action;
    store.dispatch({
      type: 'AUTO_COMPLETE',
      data,
      effect() {
        _pastCommand = data;
      }
    });
    next(action);
  } else if (action.type === 'UI_COMMAND_EXEC') {
    if (action.command === 'editor:paste') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          _didPaste = true;
        }
      });
      next(action);
    } else if (action.command === 'editor:deleteNextWord') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          _didCtrlDel = true;
          _ctrlDelArr.push(0);
        }
      });
      next(action);
    } else if (action.command === 'editor:deletePreviousWord') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          _didCtrlBckSpc = true;
          _ctrlBckArr.push(0);
        }
      });
      next(action);
    } else if (action.command === 'editor:movePreviousWord') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          _didMoveBck = true;
          _moveBckArr.push(0);
        }
      });
      next(action);
    } else if (action.command === 'editor:moveNextWord') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          _didMoveFwd = true;
          _moveFwdArr.push(0);
        }
      });
      next(action);
    } else {
      next(action);
    }
  } else {
    next(action);
  }
};

// // get rid of this?
exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'AUTO_COMPLETE':
      return state.set('autoComp', state.autoComp);
    default:
      break;
  }

  return state;
};

exports.mapTermsState = (state, map) => Object.assign(map, {
  autoComp: state.ui.autoComp
});

exports.getTermProps = (uid, parentProps, props) => Object.assign(props, {
  autoComp: parentProps.autoComp
});

// exports.decorateConfig = (config) => {
//   console.log(JSON.stringify(config));
//   return config;
// };

exports.decorateTerms = (Term, { React, notify }) => class extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.term = null;
    this.watch = new Watcher();
    this._onDecorated = this._onDecorated.bind(this);
    this._onData = this._onData.bind(this);
  }

  _onDecorated(term) {
    // Don't forget to propagate it to HOC chain
    if (this.props.onDecorated) this.props.onDecorated(term);
    this.term = term;
  }

  _onData(uid, data) {
    // Don't forget to propagate it to HOC chain
    if (this.props.onData) this.props.onData(uid, data);
    // console.log(JSON.stringify(data));
    // no special key presses
    const anyCtrl = _didCtrlDel || _didCtrlBckSpc || _didMoveFwd || _didMoveBck || _didPaste;

    if ((!this.watch.checkForArrow(data) && !this.watch.arrowTrigger)
    && (!this.watch.checkForTab(data) && !this.watch.tabTrigger) && !anyCtrl) {
      // delete, backspace, enter, and 32-126 uCodeChars
      this.watch.makeString(data);
    }
    // PASTE
    if (_didPaste) {
      this.watch._afterPaste(data);
      _didPaste = false;
    }
    // CTRL KEYS
    if (_didCtrlBckSpc) {
      this.watch._ctrlBackspace(_ctrlBckArr);
      if (_didCtrlDel) {
        this.watch._ctrlDelete(_ctrlDelArr);
        _didCtrlDel = false;
        _ctrlDelArr = [];
      }
      this.watch.makeString(data);
      _didCtrlBckSpc = false;
      _ctrlBckArr = [];
    }
    if (_didCtrlDel) {
      this.watch._ctrlDelete(_ctrlDelArr);
      this.watch.makeString(data);
      _didCtrlDel = false;
      _ctrlDelArr = [];
    }
    if (_didMoveBck) {
      this.watch._ctrlBackArrow(_moveBckArr);
      if (_didMoveFwd) {
        this.watch._ctrlForwardArrow(_moveFwdArr);
        _didMoveFwd = false;
        _moveFwdArr = [];
      }
      this.watch.makeString(data);
      _didMoveBck = false;
      _moveBckArr = [];
    }
    if (_didMoveFwd) {
      this.watch._ctrlForwardArrow(_moveFwdArr);
      this.watch.makeString(data);
      _didMoveFwd = false;
      _moveFwdArr = [];
    }

    // UP/DOWN ARROWS
    else if (data === '\x0d' && this.watch.arrowTrigger) { // enter after up or down
      this.watch._afterUpDwn(_commandHistory);
      this.watch._enterKey();
      this.watch.arrowTrigger = false;
    } else if (data === '\x7f' && this.watch.arrowTrigger) { // backspace after up/down
      this.watch._afterUpDwn(_commandHistory);
      this.watch._backSpaceKey();
      this.watch.arrowTrigger = false;
    } else if (data === '\x1b[C' && this.watch.arrowTrigger) { // right arrow up/down
      this.watch._afterUpDwn(_commandHistory);
      if (this.watch.comStr.length > this.watch.line_x) {
        this.watch.line_x++;
      }
      this.watch.arrowTrigger = false;
    } else if (data === '\x1b[D' && this.watch.arrowTrigger) { // left arrow up/down
      this.watch._afterUpDwn(_commandHistory);
      if (this.watch.line_x > 0) {
        this.watch.line_x--;
      }
      this.watch.arrowTrigger = false;
    } else if (this.watch._checkOkChars(data) && this.watch.arrowTrigger) {
      this.watch._afterUpDwn(_commandHistory);
      this.watch.makeString(data);
      this.watch.arrowTrigger = false;
    }

    // TAB
    else if (data === '\x0d' && this.watch.tabTrigger) { // enter after tab
      this.watch._afterTab(_pastCommand);
      this.watch._enterKey();
      this.watch.tabTrigger = false;
    } else if (data === '\x7f' && this.watch.tabTrigger) { // backspace after tab
      this.watch._afterTab(_pastCommand);
      this.watch._backSpaceKey();
      this.watch.tabTrigger = false;
    } else if (data === '\x1b[C' && this.watch.tabTrigger) { // right arrow after tab
      this.watch._afterTab(_pastCommand);
      if (this.watch.comStr.length > this.watch.line_x) {
        this.watch.line_x++;
      }
      this.watch.tabTrigger = false;
    } else if (data === '\x1b[D' && this.watch.tabTrigger) { // left arrow after tab
      this.watch._afterTab(_pastCommand);
      if (this.watch.line_x > 0) {
        this.watch.line_x--;
      }
      this.watch.tabTrigger = false;
    } else if (this.watch._checkOkChars(data) && this.watch.tabTrigger) {
      this.watch._afterTab(_pastCommand);
      this.watch.makeString(data);
      this.watch.tabTrigger = false;
    }
  }

  render() {
    return React.createElement(
      Term,
      Object.assign({}, this.props, {
        onDecorated: this._onDecorated,
        onData: this._onData
      })
    );
  }
};
