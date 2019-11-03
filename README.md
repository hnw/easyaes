# EasyAes

Block cipher library for non-serious use

## Description

Entering a raw password on the command line, in an environment variable, or in plain text can cause security issues.

In order to prevent the secret leakage from plain text (ex. shoulder hack), we should save encrypted strings in all storage, and decrypt passwords only when a raw password is required.

`EasyAes` provides easy-to-use encryption/decription functions. This library allows you to use encrypted strings easily in configuration files, environment variables, and command line.

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
const EasyAes = require("@hnw/easyaes");
const cipher = new EasyAes();
const yargs = require('yargs')
let argv = yargs.argv;
argv = cipher.decrypt(argv);
console.log(argv);
```

```
$ node test.js --encrypted=8EpauI1BBxvo8VzSeA3zsg==
{ _: [], encrypted: 'foobar', '$0': 'test.js' }
```
