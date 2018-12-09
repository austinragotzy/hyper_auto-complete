const tap = require('tap');
const Watcher = require('../watcher');

const watch = new Watcher();

tap.test('test ctrl backspace once with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 9;

  watch._ctrlBackspace([0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ']);
  t.same(watch.line_x, 8);
  t.end();
});

tap.test('test ctrl backspace twice with more than 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 9;

  watch._ctrlBackspace([0, 0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ']);
  t.same(watch.line_x, 4);
  t.end();
});

tap.test('test ctrl backspace once with 1 word', (t) => {
  watch.comStr = ['a', 'b', 'c'];
  watch.line_x = 3;

  watch._ctrlBackspace([0]);
  t.same(watch.comStr, []);
  t.same(watch.line_x, 0);
  t.end();
});

tap.test('test ctrl backspace once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 5;

  watch._ctrlBackspace([0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', 'e', 'v', ' ', 'w']);
  t.end();
});

tap.test('test ctrl backspace twice in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 5;

  watch._ctrlBackspace([0, 0]);
  t.same(watch.comStr, ['e', 'v', ' ', 'w']);
  t.same(watch.line_x, 0);
  t.end();
});

tap.test('test ctrl backspace three in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w', ' ', 'd', 'e'];
  watch.line_x = 10;

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
    'k', ' ', ' '];

  watch.line_x = 15;

  watch._ctrlBackspace([0, 0, 0, 0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ']);
  t.end();
});

tap.test('test ctrl backspace once in middle of word', (t) => {
  watch.comStr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
  watch.line_x = 7;

  watch._ctrlBackspace([0]);
  t.same(watch.comStr, ['a', 'b', 'c', ' ', ' ', 'w']);
  t.same(watch.line_x, 4);
  t.end();
});
