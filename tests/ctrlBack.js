const tap = require('tap');
const Watcher = require('../watcher');

const watch = new Watcher();

tap.test('test ctrl backspace once with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 9;

  watch.ctrlBackspace();
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ']);
  t.same(watch.line_x, 8);
  t.end();
});


tap.test('test ctrl backspace once with 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 3;

  watch.ctrlBackspace();
  t.same(watch.comStr, []);
  t.same(watch.line_x, 0);
  t.end();
});

tap.test('test ctrl backspace once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 5;

  watch.ctrlBackspace();
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'e', 'v', ' ', 'w']);
  t.end();
});

tap.test('test ctrl backspace once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 7;

  watch.ctrlBackspace();
  t.same(watch.comStr, ['a', 'b', 'c', ' ', ' ', 'w']);
  t.same(watch.line_x, 4);
  t.end();
});
