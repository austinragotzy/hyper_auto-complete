const TrieSearch = require('trie-search');

const Watcher = require('./watcher');
const { fetchCmds, loadForTrie } = require('./utils');

const CMD = 'cmd';

const watch = new Watcher();
const trie = new TrieSearch(CMD);

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
        // load up something for trie to use for
        // bash auto complete
        _commandHistory = await fetchCmds();
        const words = loadForTrie(_commandHistory, CMD);
        trie.addAll(words);
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
    // make this more accurate
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
        // console.log(watch.commandArr);
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
    this._dropDown = null;
    this._frame = null;
    this._origin = null;
    this._onDecorated = this._onDecorated.bind(this);
    this._onCursorMove = this._onCursorMove.bind(this);
  }

  _onDecorated(term) {
    if (this.props.onDecorated) this.props.onDecorated(term);
    this._term = term;
    this._div = term ? term.termRef : null;
    // console.log(term);
  }

  _onCursorMove(frame) {
    if (this.props.onCursorMove) this.props.onCursorMove(frame);
    console.log(this._term);
    // eslint-disable-next-line
    const cmdChars = watch.cmdChars;
    const cmdHintArr = trie.get(cmdChars);

    this._frame = frame;
    // console.log(this._frame);
    this._origin = this._div.getBoundingClientRect();
    // console.log(this._origin);
    if (cmdChars.length >= 2 && cmdHintArr.length > 0) {
      if (this._dropDown) {
        this._removeDropDown();
        this._initDropDown(cmdHintArr);
      } else {
        this._initDropDown(cmdHintArr);
      }
    } else if (this._dropDown) {
      this._removeDropDown();
    }
  }

  _span(text) {
    const span = document.createElement('span');

    span.addEventListener('click', (ev) => {
      // eslint-disable-next-line
      const cmdChars = watch.cmdChars;
      const toSend = `${'\b'.repeat(cmdChars.length)}${ev.target.innerText}`;
      console.log('[click]');
      console.dir(ev);
      window.rpc.emit('data', { uid: this.props.uid, data: toSend });
    });
    span.addEventListener('mouseenter', (ev) => {
      span.style.backgroundColor = this._term.props.colors.lightBlack;
    });
    span.addEventListener('mouseleave', (ev) => {
      span.style.backgroundColor = this._term.props.backgroundColor;
    });
    span.addEventListener('focus', (ev) => {
      span.style.backgroundColor = this._term.props.colrs.lightBlack;
    });
    span.style.cursor = 'pointer';
    span.style.fontFamily = this._term.props.fontFamily;
    span.style.fontSize = `${this._term.props.fontSize}px`;
    span.style.backgroundColor = this._term.props.backgroundColor;
    span.style.color = this._term.props.colors.green;
    span.style.padding = '5px';
    span.style.display = 'block';
    span.id = 'list';
    span.innerText = text;
    this._dropDown.appendChild(span);
    return span;
  }

  _setDDCss() {
    this._dropDown = document.createElement('div');
    this._dropDown.style.position = 'relative';
    this._dropDown.style.zIndex = '1';
    this._dropDown.style.top = `${this._frame.y + this._origin.top + 14}px`;
    this._dropDown.style.left = `${this._frame.x + this._origin.left}px`;
    this._dropDown.style.fontFamily = this._term.props.fontFamily;
    this._dropDown.style.fontSize = `${this._term.props.fontSize}px`;
    this._dropDown.style.color = this._term.props.colors.green;
    this._dropDown.style.backgroundColor = this._term.props.backgroundColor;
    this._dropDown.style.border = `1px solid ${this._term.props.colors.cyan}`;
    this._dropDown.style.minWidth = '100px';
    this._dropDown.style.maxWidth = '160px';
    this._dropDown.style.display = 'inline-block';
    this._dropDown.style.overflow = 'hidden';
    // this._dropDown.style.pointerEvents = 'none';
    this._dropDown.height = this._frame.height;
  }

  _initDropDown(hintArr) {
    this._setDDCss();
    this._dropDown.addEventListener('keypress', (ev) => {
      console.log(e.keyCode);
      let index = 0;
      // up
      if (e.keyCode === 38) {
        if (index > 0) {
          index--;
          document.getElementsByName('span')[index].focus();
        } else {
          document.getElementById('span').focus();
        }
      }
      // down
      if (e.keyCode === 40) {
        const spanArr = document.getElementsByName('span');
        if (index < spanArr.length) {
          index++;
          spanArr[index].focus();
        } else {
          spanArr[index].focus();
        }
      }
      // enter
      if (e.keyCode === 13) {
        const selected = document.getElementById('span:focus');
        selected.click();
      }
    });
    document.body.appendChild(this._dropDown);

    let span;
    for (let i = 0; i < hintArr.length; i++) {
      const obj = hintArr[i];
      if (!obj) break;

      const word = obj[CMD];
      span = this._span(word);
    }
    this._dropDown.focus();
  }

  _removeDropDown() {
    this._dropDown.remove();
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
