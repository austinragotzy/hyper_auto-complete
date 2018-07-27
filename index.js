const fs = require('fs-extra');


exports.middleware = (store) => (next) => (action) => {
    if ('SESSION_ADD_DATA' === action.type) {
      const { data } = action;
      if (/auto-complete: command not found/.test(data)) {
        store.dispatch({
          type: 'AUTO_COMPLETE',
        });
      } else {
        next(action);
      }
    } else {
      next(action);
    }
};

exports.reduceUI = (state, action) => {
    switch (action.type) {
      case 'AUTO_COMPLETE':
        return state.set('autoComp', !state.autoComp);
    }

    return state;
};

exports.mapTermsState = (state, map) => {
    return Object.assign(map, {
      autoComp: state.ui.autoComp
    });
};

exports.getTermProps = (uid, parentProps, props) => {
    return Object.assign(props, {
      autoComp: parentProps.autoComp
    });
};

exports.decorateTerms = (Term, {React, notify}) => {
    return class extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.term = null;
            this._onDecorated = this._onDecorated.bind(this);
        }
  
        _onDecorated(term) {
            // Don't forget to propagate it to HOC chain
            if (this.props.onDecorated) this.props.onDecorated(term);
            this.term = term;
        }

        _saveInputForTrain(term){
            const id = this.props.activeSession

            const termLines = term.terms[id].term.buffer.lines;

            let terminalText = [];
            let line_num;

            for (line_num = 0;
                line_num < termLines.length;
                line_num++) {
                    let char_array;
                    let line = '';
                    let non_whitespace_found = false;
                    for (char_array = termLines._array[line_num].length - 1;        char_array >= 0;
                        char_array--) {
                        // Build lines character by character, removing trailing whitespace
                        let char = termLines._array[line_num][char_array][1];

                        if ((non_whitespace_found && char == ' ') || (non_whitespace_found && char != ' ')) {
                            line = char + line; // first index is actual char
                        } else if (!non_whitespace_found && char == ' ') {
                            continue;
                        } else if (!non_whitespace_found && char != ' ') {
                            non_whitespace_found = true;
                            line = char + line; // first index is actual char
                        }
                    }
        
                terminalText.push(line);
                }

            console.log(terminalText);
        }

        componentWillReceiveProps (next) {
            if(next.autoComp) this._saveInputForTrain(this.term);
            if (next.autoComp && !this.props.autoComp) {
                notify('autoComplete is recording');
            } else if (!next.autoComp && this.props.autoComp) {
                notify('autoComplete is NOT recording');
            }
        }

        render() {
            return React.createElement(
                Term,
                Object.assign({}, this.props, {
                onDecorated: this._onDecorated
                })
            );
        }

    }
}