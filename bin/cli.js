#!/usr/bin/env node

const yargs = require('yargs')
      .alias('p', 'password')
      .alias('e', 'encrypt')
      .alias('d', 'decrypt')
      .alias('t', 'type')
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
      const test = /(^|[^A-Za-z0-9/])(([A-Za-z0-9/+]{4})*[A-Za-z0-9/+]{2}==)/g;
      const decrypted = str.replace(test, (_, p1, p2) => p1 + cipher.decrypt(p2));
      console.log(decrypted);
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
