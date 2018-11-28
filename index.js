const fs = require('fs-extra');
const AutoComp = require('./autoComp');
const { fetchCmds } = require('./utils');

// grab cmd from arrows, tab and paste then use on next input
let _pastCommand;
// array from .bash_history
let _commandHistory;
// paste is a UI_COMMAND_EXEC event
let _didPaste = false;

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
  } else if (action.type === 'UI_COMMAND_EXEC' && action.command === 'editor:paste') {
    store.dispatch({
      type: 'AUTO_COMPLETE',
      effect() {
        _didPaste = true;
      }
    });
    next(action);
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

exports.decorateTerms = (Term, { React, notify }) => class extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.term = null;
    this.ac = new AutoComp();
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

    // no special key presses
    if ((!this.ac._checkForArrow(data) && !this.ac.arrowTrigger)
    && (!this.ac._checkForTab(data) && !this.ac.tabTrigger)) {
      this.ac._makeString(data);
    } if (data === '\x0d' && this.ac.arrowTrigger) { // enter after up or down
      this.ac.comStr = this.ac._getArrowCmd(_commandHistory);
      this.ac._enterKey();
      this.ac.arrowTrigger = false;
    } if (data === '\x7f' && this.ac.arrowTrigger) { // backspace after up/down
      this.ac.comStr = this.ac._getArrowCmd(_commandHistory);
      this.ac.line_x = this.ac.comStr.length;
      this.ac._backSpaceKey();
      this.ac.arrowTrigger = false;
    } if (data === '\x1b[C' && this.ac.arrowTrigger) { // right arrow up/down
      this.ac.comStr = this.ac._getArrowCmd(_commandHistory);
      this.ac.line_x = this.ac.comStr.length;
      if (this.ac.comStr.length > this.ac.line_x) {
        this.ac.line_x++;
      }
      this.ac.arrowTrigger = false;
    } if (data === '\x1b[D' && this.ac.arrowTrigger) { // left arrow up/down
      this.ac.comStr = this.ac._getArrowCmd(_commandHistory);
      this.ac.line_x = this.ac.comStr.length;
      if (this.ac.line_x > 0) {
        this.ac.line_x--;
      }
      this.ac.arrowTrigger = false;
    } if (data === '\x0d' && _didPaste) { // enter after paste
      this.ac.comStr = _pastCommand.split('');
      this.ac.line_x = this.ac.comStr.length;
      this.ac._enterKey();
      _didPaste = false;
    } if (data === '\x7f' && _didPaste) { // backspace after paste
      this.ac.comStr = _pastCommand.split('');
      this.ac.line_x = this.ac.comStr.length;
      this.ac._backSpaceKey();
      _didPaste = false;
    } if (data === '\x1b[C' && _didPaste) { // right arrow after paste
      this.ac.comStr = _pastCommand.split('');
      this.ac.line_x = this.ac.comStr.length;
      if (this.ac.comStr.length > this.ac.line_x) {
        this.ac.line_x++;
      }
      _didPaste = false;
    } if (data === '\x1b[D' && _didPaste) { // left arrow after paste
      this.ac.comStr = _pastCommand.split('');
      this.ac.line_x = this.ac.comStr.length;
      if (this.ac.line_x > 0) {
        this.ac.line_x--;
      }
      _didPaste = false;
    } if (data === '\u001b[3~') { // delete key
      this.ac._deleteKey();
    } if (data === '\x0d' && this.ac.tabTrigger) { // enter after tab
      this.ac._afterTab(_pastCommand);
      this.ac.line_x = this.ac.comStr.length;
      this.ac._enterKey();
      this.ac.tabTrigger = false;
    } if (data === '\x7f' && this.ac.tabTrigger) { // backspace after tab
      this.ac.comStr = _pastCommand.split('');
      this.ac.line_x = this.ac.comStr.length;
      this.ac._backSpaceKey();
      this.ac.tabTrigger = false;
    } if (data === '\x1b[C' && this.ac.tabTrigger) { // right arrow after tab
      this.ac.comStr = _pastCommand.split('');
      this.ac.line_x = this.ac.comStr.length;
      if (this.ac.comStr.length > this.ac.line_x) {
        this.ac.line_x++;
      }
      this.ac.tabTrigger = false;
    } if (data === '\x1b[D' && this.ac.tabTrigger) { // left arrow after tab
      this.ac.comStr = _pastCommand.split('');
      this.ac.line_x = this.ac.comStr.length;
      if (this.ac.line_x > 0) {
        this.ac.line_x--;
      }
      this.ac.tabTrigger = false;
    }
  }

  render() {
    return React.createElement(
      Term,
      Object.assign({}, this.props, {
        onDecorated: this._onDecorated,
        onData: this._onData,
      })
    );
  }
};
