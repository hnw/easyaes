#!/usr/bin/env node

const yargs = require('yargs')
      .alias('e', 'encrypt')
      .alias('d', 'decrypt')
      .locale('en');
const argv = yargs.argv;

const crypto = require('crypto');
const readline=require("readline");
const EasyAes=require("../easyaes");

const rl=readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "",
  terminal: false
});

let password = argv.password || EasyAes.getPasswordFromFile();

const mainLoop = (password) => {
  cipher = new EasyAes(password);
  rl.on("line", (str) => {
    if (argv.decrypt) {
      console.log(cipher.decrypt(str));
    } else {
      console.log(cipher.encrypt(str));
    }
  });
};

const getPasswordThenLoop = () => {
  process.stdin.setRawMode(true);
  rl.question('Password: ', (str) => {
    if (str !== '') {
      process.stdin.setRawMode(false);
      console.log();
      mainLoop(str);
    } else {
      console.log();
      getPasswordThenLoop();
    }
  });
};

const generateKey = (algorithm) => {
  const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%+,-./:=@^_~'
  let keyLength = EasyAes.getKeyLength(algorithm);
  if (keyLength == 0) {
    algorithm = 'bf';
    keyLength = EasyAes.getKeyLength(algorithm);
  }
  let key = EasyAes.getCipherId(algorithm);
  let randomBytes = crypto.randomBytes(keyLength);
  for (let i = 0; i < keyLength; i++) {
    key += pool[randomBytes[i] % pool.length];
  }
  console.log(key);
}

if (argv.keygen) {
  generateKey(argv.type);
  process.exit(0);
} else if (password === '') {
  if (process.stdin.isTTY) {
    getPasswordThenLoop();
  } else {
    throw new Error('You must specify password when you use pipe/redirect.');
  }
} else {
  mainLoop(password);
}
