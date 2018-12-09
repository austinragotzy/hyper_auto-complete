const arr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
const Watch = require('./watcher');

const w = new Watch();

w.comStr = arr;
w.line_x = 0;

const delArr = [0, 0, 0];
w._ctrlForwardArrow(delArr);

console.log(w.line_x, w.comStr);
