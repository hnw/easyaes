# EasyAes

Block cipher library for non-serious use

## Description

Entering a raw password on the command line, in an environment variable, or in plain text can cause security issues.

In order to prevent the secret leakage, it is necessary to use encrypted strings in all plain text, and decrypt passwords only when a raw password is required.

`EasyAes` provides easy-to-use encryption/decription library and command-line tools. `EasyAes` allows you to use encrypted strings in configuration files, environment variables, and command line.

## Features

- Easy-to-use
- Node.js module which provides {AES, Blowfish, 3DES} {encryption, decryption}
- A command line tool which provides {encryption, decryption, secret key generator}
- Force CBC mode
- Automatically randomize initialization vector

## Install

```
$ npm i @hnw/easyaes
```

## Setup

```
$ $(npm bin)/easyaes --keygen > $HOME/.easyaes
```

## Example 1

```
$ echo "foobar" | $(npm bin)/easyaes --encrypt
8EpauI1BBxvo8VzSeA3zsg==
$ echo "8EpauI1BBxvo8VzSeA3zsg==" | $(npm bin)/easyaes --decrypt
foobar
```

## Example 2

```javascript
const EasyAes=require("@hnw/easyaes");
cipher = new EasyAes();
console.log(cipher.decrypt('8EpauI1BBxvo8VzSeA3zsg==')); // foobar
```

## Example 3

```javascript
const EasyAes=require("@hnw/easyaes");
const yargs = require('yargs')
let argv = yargs.argv;
cipher = new EasyAes();
argv = cipher.decrypt(argv);
console.log(argv);
```

```
$ test.js --encrypted=8EpauI1BBxvo8VzSeA3zsg==
{ _: [], encrypted: 'foobar', '$0': 'test.js' }
```
