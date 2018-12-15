const tap = require('tap');
const Watcher = require('../watcher');

const watch = new Watcher();

tap.test('test ctrl forward arrow 1', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 0;

  watch.ctrlForwardArrow();
  t.same(watch.line_x, 3);
  t.end();
});

tap.test('test ctrl forward arrow with 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 0;

  watch.ctrlForwardArrow();
  t.same(watch.line_x, 3);
  t.end();
});

tap.test('test ctrl forward arrow in middle', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 3;

  watch.ctrlForwardArrow();
  t.same(watch.line_x, 7);
  t.end();
});
