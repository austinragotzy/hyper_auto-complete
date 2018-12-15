const Watcher = require('./watcher');
const { fetchCmds } = require('./utils');

const watch = new Watcher();

// grab cmd from arrows, tab and paste then use on next input
let _pastCommand;
// array from .bash_history
let _commandHistory;
// paste is a UI_COMMAND_EXEC event
let _didPaste = false;
// need to know when we enter REPL
let _inREPL = false;

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
  } else if (action.type === 'SESSION_PTY_DATA') {
    const { data } = action;
    if (data.includes('>')) {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        data,
        effect() {
          _inREPL = true;
        }
      });
      next(action);
    } else {
      next(action);
    }
  } else if (action.type === 'SESSION_SET_XTERM_TITLE') {
    store.dispatch({
      type: 'AUTO_COMPLETE',
      effect() {
        _inREPL = false;
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
          watch.ctrlDelete();
        }
      });
      next(action);
    } else if (action.command === 'editor:deletePreviousWord') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          watch.ctrlBackspace();
        }
      });
      next(action);
    } else if (action.command === 'editor:movePreviousWord') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          watch.ctrlBackArrow();
        }
      });
      next(action);
    } else if (action.command === 'editor:moveNextWord') {
      store.dispatch({
        type: 'AUTO_COMPLETE',
        effect() {
          watch.ctrlForwardArrow();
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

// Watches text input and creates string for infrence from model
exports.decorateTerms = (Term, { React, notify }) => class extends React.Component {
  constructor(props, context) {
    super(props, context);
    this._onData = this._onData.bind(this);
  }

  _onData(uid, data) {
    // Don't forget to propagate it to HOC chain
    if (this.props.onData) this.props.onData(uid, data);
    // TODO might not be the best way of doing this
    if (!_inREPL) {
      const specialKeys = watch.checkForArrow(data) || watch.arrowTrigger
        || watch.checkForTab(data) || watch.tabTrigger || _didPaste;

      if (!specialKeys) {
      // delete, backspace, enter, and 32-126 uni code chars
        watch.makeString(data);
        // TO CHECK ACCURACY REMOVE SOON
        console.log(watch.commandArr);
      } else if (_didPaste) { // PASTE
        watch.afterPaste(data);
        _didPaste = false;
      } else if (watch.arrowTrigger) { // UP/DOWN ARROWS
        watch.watchArrows(data, _commandHistory);
      } else if (watch.tabTrigger) { // TAB
        watch.watchTab(data, _pastCommand);
      }
    }
  }

  render() {
    return React.createElement(
      Term,
      Object.assign({}, this.props, {
        onData: this._onData
      })
    );
  }
};

// takes output from model and shows to user
exports.decorateTerm = (Term, { React, notify }) => class extends React.Component {
  constructor(props, context) {
    super(props, context);
    this._term = null;
    this._div = null;
    this._canvas = null;
    this._frame = null;
    this._origin = null;
    this._onDecorated = this._onDecorated.bind(this);
    this._onCursorMove = this._onCursorMove.bind(this);
  }

  _onDecorated(term) {
    if (this.props.onDecorated) this.props.onDecorated(term);
    this._term = term;
    this._div = term ? term.termRef : null;
    console.log(term);
  }

  _onCursorMove(frame) {
    // Don't forget to propagate it to HOC chain
    if (this.props.onCursorMove) this.props.onCursorMove(frame);
    console.log(frame);
    this._frame = frame;
    this._origin = this._div.getBoundingClientRect();
    console.log(this._origin);
    if (this._canvas) {
      this._removeSpan();
      this._initSpan();
      this._canvas.innerText = 'poop';
    } else {
      this._initSpan();
      this._canvas.innerText = _commandHistory[_commandHistory.length - 50];
    }
  }

  _initSpan() {
    this._canvas = document.createElement('span');
    this._canvas.style.position = 'absolute';
    this._canvas.style.zIndex = '1';
    this._canvas.style.top = `${this._frame.y + this._origin.top}px`;
    this._canvas.style.left = `${this._frame.x + this._origin.left + 7}px`;
    this._canvas.style.fontFamily = this._term.props.fontFamily;
    this._canvas.style.fontSize = `${this._term.props.fontSize}px`;
    this._canvas.style.backgroundColor = this._term.props.backgroundColor;
    this._canvas.style.color = this._term.props.colors.green;
    this._canvas.style.pointerEvents = 'none';
    this._canvas.height = this._frame.height;
    document.body.appendChild(this._canvas);
  }

  _removeSpan() {
    document.body.removeChild(this._canvas);
  }

  render() {
    return React.createElement(
      Term,
      Object.assign({}, this.props, {
        onDecorated: this._onDecorated,
        onCursorMove: this._onCursorMove,
      })
    );
  }
};
