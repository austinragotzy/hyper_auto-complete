const tap = require('tap');
const Watcher = require('../watcher');

const watch = new Watcher();

tap.test('test ctrl delete once with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 3;

  watch.ctrlDelete();
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'w']);
  t.end();
});

tap.test('test ctrl delete once with 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 0;

  watch.ctrlDelete();
  t.same(watch.comStr, []);
  t.end();
});

tap.test('test ctrl delete once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 4;

  watch.ctrlDelete();
  t.same(watch.comStr, ['a', 'b', 'c', ' ', ' ', 'w']);
  t.end();
});

tap.test('test ctrl delete once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 2;

  watch.ctrlDelete();
  t.same(watch.comStr, ['a', 'b', ' ', 'd', 'e', 'v', ' ', 'w']);
  t.same(watch.line_x, 2);
  t.end();
});
