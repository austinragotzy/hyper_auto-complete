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

tap.test('test ctrl delete once with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 4;

  watch._ctrlDelete([0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'w']);
  t.end();
});

tap.test('test ctrl delete twice with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 4;

  watch._ctrlDelete([0, 0]);
  t.same(watch.comStr, ['a', 'b', 'c']);
  t.end();
});

tap.test('test ctrl delete once with 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 1;

  watch._ctrlDelete([0]);
  t.same(watch.comStr, []);
  t.end();
});

tap.test('test ctrl delete once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 5;

  watch._ctrlDelete([0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', ' ', 'w']);
  t.end();
});

tap.test('test ctrl delete twice in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 6;

  watch._ctrlDelete([0, 0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'd']);
  t.end();
});

tap.test('test ctrl delete once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 3;

  watch._ctrlDelete([0]);
  t.same(watch.comStr, ['a', 'b', ' ', 'd', 'e', 'v', ' ', 'w']);
  t.end();
});

tap.test('test ctrl delete three times with 3 words', (t) => {
  watch.comStr = ['a', 'b', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 1;

  watch._ctrlDelete([0, 0, 0]);
  t.same(watch.comStr, []);
  t.end();
});

tap.test('test ctrl delete three in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 3;

  watch._ctrlDelete([0, 0, 0]);
  t.same(watch.comStr, ['a', 'b']);
  t.end();
});

tap.test('test ctrl delete four in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w', ' ', 'd', ' '];
  watch.line_x = 3;

  watch._ctrlDelete([0, 0, 0, 0]);
  t.same(watch.comStr, ['a', 'b', ' ']);
  t.end();
});

tap.test('test ctrl delete four in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w', ' ', 'd', ' '];
  watch.line_x = 2;

  watch._ctrlDelete([0, 0, 0, 0]);
  t.same(watch.comStr, ['a', ' ']);
  t.end();
});
