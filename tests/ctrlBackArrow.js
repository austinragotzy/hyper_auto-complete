const tap = require('tap');
const Watcher = require('../watcher');

const watch = new Watcher();

tap.test('test ctrl back arrow 1', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 9;

  watch.ctrlBackArrow();
  t.same(watch.line_x, 8);
  t.end();
});

tap.test('test ctrl back arrow with 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 3;

  watch.ctrlBackArrow();
  t.same(watch.line_x, 0);
  t.end();
});
