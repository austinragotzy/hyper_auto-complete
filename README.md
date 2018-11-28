# Auto-Complete for Hyper 

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

## Auto-Complete
Built with React for Hyper and Tensorflow for the machine learning.
Command line augmentation meant to provide true auto completion for Hyper.Js using 
Node.Js and python... maybe more stuff we shall see what bumps we hit down the road.
At the moment the idea is to use deep learning to do the auto completion using most
likely tensorflow and or some package on top of that. lets have some fun! (;

## Check it out
[Auto-Complete](https://github.com/austinragotzy/hyper_auto-complete)


## Installing and using in Hyper
To use this with hyper simply add hyper_auto-complete to your .hyper.js

```json
plugins: ['hyper_auto-complete'],
```

or clone the [git repo](https://github.com/austinragotzy/hyper_auto-complete) and add to local plugins
in .hyper.js

```json
localPlugins: [`hyper_auto-complete`],

```
and help us develop and add to this project

```js
arr.foreach(val, i, () => {
    if (val === 2) {
        return val;
    }
})
```

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo
