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

tap.test('test ctrl backspace once with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 9;

  watch._ctrlBackspace([0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ']);
  t.end();
});

tap.test('test ctrl backspace twice with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 9;

  watch._ctrlBackspace([0, 0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ']);
  t.end();
});

tap.test('test ctrl backspace once with 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 3;

  watch._ctrlBackspace([0]);
  t.same(watch.comStr, []);
  t.end();
});

tap.test('test ctrl backspace once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 6;

  watch._ctrlBackspace([0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'e', 'v', ' ', 'w']);
  t.end();
});

tap.test('test ctrl backspace twice in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 6;

  watch._ctrlBackspace([0, 0]);
  t.same(watch.comStr, ['e', 'v', ' ', 'w']);
  t.end();
});

tap.test('test ctrl backspace three in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w', ' ', 'd', 'e'];
  watch.line_x = 11;

  watch._ctrlBackspace([0, 0, 0]);
  t.same(watch.comStr, ['d', 'e']);
  t.end();
});

tap.test('test ctrl backspace four at end of word', (t) => {
  watch.comStr = [
    'a', 'b', 'c', ' ',
    'd', 'e', 'v', ' ',
    'w', ' ',
    'd', ' ',
    'k'];

  watch.line_x = 13;

  watch._ctrlBackspace([0, 0, 0, 0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ']);
  t.end();
});
