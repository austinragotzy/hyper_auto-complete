const tap = require('tap');
const Watcher = require('../watcher');

const keys = {
  enter: '\x0d',
  backSp: '\x7f',
  delete: '\u001b[3~',
  arrowUp: '\x1b[A',
  arrowDown: '\x1b[B',
  arrowLeft: '\x1b[D',
  arrowRight: '\x1b[C',
};


const watch = new Watcher();


tap.test('test enter key press', (t) => {
  watch.comStr = ['a', 'b', 'c'];

  watch.makeString(keys.enter);
  t.same(watch.commandArr, ['abc']);
  t.equal(watch.line_x, 0);
  t.end();
});

tap.test('test backspace key press', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 3;

  watch.makeString(keys.backSp);
  t.same(watch.comStr, ['a', 'b']);
  t.equal(watch.line_x, 2);
  t.end();
});

tap.test('test delete key press', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 1;

  watch.makeString(keys.delete);
  t.same(watch.comStr, ['a', 'c']);
  t.equal(watch.line_x, 1);
  t.end();
});

tap.test('test normal key press', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 3;

  watch.makeString('d');
  t.same(watch.comStr, ['a', 'b', 'c', 'd']);
  t.equal(watch.line_x, 4);
  t.end();
});
