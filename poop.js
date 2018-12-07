const arr = ['a', 'b', 'c', ' ', 'd', 'e', 'v', ' ', 'w'];
const Watch = require('./watcher');
// if (this.line_x !== 0) {
//     // cursor is at the end of array
//     if (this.line_x === this.comStr.length) {
//       this.comStr.pop();
//       // somewhere in the middle of the array
//     } else {
//       this.comStr = this.comStr.slice(0, this.line_x - 1)
//         .concat(this.comStr.slice(this.line_x));
//     }
//     this.line_x--;
//   }

const w = new Watch();

w.comStr = arr;
w.line_x = 6;

const delArr = [0, 0];
w._ctrlBackspace(delArr);
