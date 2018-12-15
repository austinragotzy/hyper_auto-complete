const tap = require('tap');
const Watcher = require('../watcher');

const watch = new Watcher();

tap.test('test tab insert', (t) => {
  const cmdEnd = 'lder/';
  watch.comStr = ['f', 'o'];
  watch.line_x = 2;

  watch._afterTab(cmdEnd);
  t.same(watch.comStr, ['f', 'o', 'l', 'd', 'e', 'r', '/']);
  t.same(watch.line_x, 7);
  t.end();
});


tap.test('test tab insert onto new line', (t) => {
  const cmdEnd = 'l\r\nder';
  watch.comStr = ['f', 'o'];
  watch.line_x = 2;

  watch._afterTab(cmdEnd);
  t.same(watch.comStr, ['f', 'o', 'l', 'd', 'e', 'r']);
  t.same(watch.line_x, 6);
  t.end();
});

tap.test('test tab insert with no folder found', (t) => {
  const cmdEnd = '\u0007';
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 3;

  watch._afterTab(cmdEnd);
  t.same(watch.comStr, ['a', 'b', 'c']);
  t.end();
});
