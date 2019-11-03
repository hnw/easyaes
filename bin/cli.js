#!/usr/bin/env node

const yargs = require('yargs')
      .usage('Usage:')
      .usage('  $0 --keygen [--type [aes|blowfish|3des]]')
      .usage('  $0 --encrypt')
      .usage('  $0 --decrypt')
      .describe('keygen', 'Generate password')
      .describe('encrypt', 'Encrypt mode')
      .describe('decrypt', 'Decrypt mode')
      .describe('type', 'Specify encryption algorithm')
      .describe('password', 'Specify password (for debug)')
      .string('type')
      .string('password')
      .default('type', 'aes')
      .alias('e', 'encrypt')
      .alias('d', 'decrypt')
      .alias('t', 'type')
      .alias('p', 'password')

      .locale('en');
const argv = yargs.argv;

const crypto = require('crypto');
const readline = require("readline");
const EasyAes = require("../easyaes");
const {Writable} = require('stream')

const mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  }
});

const rl=readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  prompt: "",
  terminal: true
});

const generateKey = (algorithm) => {
  const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%+,-./:=@^_~';
  let cipherId = EasyAes.getCipherId(algorithm);
  if (!cipherId) {
    // type not specified or unknown type specified
    cipherId = 'a'; // default type = AES
  }
  const keyLength = EasyAes.getMaximumKeyLength(cipherId);
  let key = cipherId;
  const randomBytes = crypto.randomBytes(keyLength);
  for (let i = 0; i < keyLength; i++) {
    key += pool[randomBytes[i] % pool.length];
  }
  console.log(key);
}

const password = argv.password || EasyAes.getPasswordFromFile();

if (argv.keygen) {
  generateKey(argv.type);
  process.exit(0);
} else if (password === '') {
  console.error('Password not found. Try "$(npm bin)/easyaes --keygen > $HOME/.easyaes"');
  process.exit(1);
} else {
  const cipher = new EasyAes(password);
  if (argv.decrypt) {
    const test = /(^|[^A-Za-z0-9/])(([A-Za-z0-9/+]{4})*[A-Za-z0-9/+]{2}==)/g;
    rl.on("line", (str) => {
      console.log(str.replace(test, (_, p1, p2) => p1 + cipher.decrypt(p2)));
    });
  } else if (argv.decrypt) {
    mutableStdout.muted = true;
    rl.on("line", (str) => {
      console.log(cipher.encrypt(str));
    });
  } else {
    yargs.showHelp()
    process.exit(1);
  }
}
