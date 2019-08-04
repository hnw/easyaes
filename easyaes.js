`use strict`;

const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const CIPHER_ID = {
  'aes': 'a',
  'bf': 'b',
  'blowfish': 'b',
  'des': 'd',
  '3des': 'd',
  'des3': 'd',
}
const CIPHER = {
  a: 'aes-256-cbc',
  b: 'bf-cbc',
  d: 'des-ede3-cbc',
}
const BLOCK_SIZE = {
  a: 16,
  b: 8,
  d: 8,
}
const MINIMUM_KEY_LENGTH = {
  a: 32,
  b: 1,
  d: 24,
}
const MAXIMUM_KEY_LENGTH = {
  a: 32,
  b: 56,
  d: 24,
}

class EasyAes {
  constructor(spec) {
    let cipherId = '';
    let password = '';
    if (spec === undefined || typeof spec === 'string') {
      password = String(spec || EasyAes.getPasswordFromFile());
      cipherId = password[0];
    } else if (typeof spec === 'object') {
	({algorithm,password} = spec);
    }
    const minLen = EasyAes.getMinimumKeyLength(cipherId);
    const maxLen = EasyAes.getMaximumKeyLength(cipherId);
    if ((password.length - 1) < minLen || (password.length - 1) > maxLen) {
      throw new Error('Unexpected Secret key length. Try "$(npm bin)/easyaes --keygen > $HOME/.easyaes"');
    }
    password = password.substring(1, maxLen + 1);
    this._cipherId = cipherId;
    this._password = password;
  }

  static getCipherId(algorithm) {
    if (!CIPHER_ID.hasOwnProperty(algorithm)) {
      return '';
    }
    return CIPHER_ID[algorithm];
  }

  static getCipher(cipherId) {
    if (!CIPHER.hasOwnProperty(cipherId)) {
      return '';
    }
    return CIPHER[cipherId];
  }

  static getBlockSize(cipherId) {
    if (!BLOCK_SIZE.hasOwnProperty(cipherId)) {
      return 0;
    }
    return BLOCK_SIZE[cipherId];
  }

  static getMinimumKeyLength(cipherId) {
    if (!MINIMUM_KEY_LENGTH.hasOwnProperty(cipherId)) {
      return 0;
    }
    return MINIMUM_KEY_LENGTH[cipherId];
  }

  static getMaximumKeyLength(cipherId) {
    if (!MAXIMUM_KEY_LENGTH.hasOwnProperty(cipherId)) {
      return 0;
    }
    return MAXIMUM_KEY_LENGTH[cipherId];
  }

  static getPasswordFromFile(path) {
    const homedir = os.homedir();
    const keyfile = homedir + '/.easyaes';
    let password = '';
    if (fs.existsSync(keyfile)) {
      password = fs.readFileSync(keyfile, {encoding: "utf-8"});
    }
    return password.trim();
  }

  encrypt(obj) {
    if (typeof obj === "string") {
      return this._encryptString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(text => this._encryptString(text));
    } else if (typeof obj === "object") {
      return this._encryptObject(obj);
    } else {
      return obj;
    }
  }

  decrypt(obj) {
    if (typeof obj === "string") {
      return this._decryptString(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(text => this._decryptString(text));
    } else if (typeof obj === "object") {
      return this._decryptObject(obj);
    } else {
      return obj;
    }
  }

  _encryptObject(obj) {
    const newObj = {};
    for (let k of Object.keys(obj)) {
      newObj[k] = this.encrypt(obj[k]);
    }
    return newObj;
  }

  _decryptObject(obj) {
    const newObj = {}
    for (let k of Object.keys(obj)) {
      newObj[k] = this.decrypt(obj[k]);
    }
    return newObj;
  }

  _encryptString(rawText) {
    const blockSize = EasyAes.getBlockSize(this._cipherId);
    let iv = crypto.randomBytes(blockSize);
    const algorithm = EasyAes.getCipher(this._cipherId);
    let cipher = crypto.createCipheriv(algorithm, this._password, iv);
    let encrypted = cipher.update(rawText);
    encrypted = Buffer.concat([iv, encrypted, cipher.final()]);
    return this._base64Encode(encrypted);
  }

  _decryptString(cipherText) {
    let decoded = this._base64Decode(cipherText);
    if (decoded === '') {
      return cipherText;
    }
    const len = decoded.length;
    if (len < 16) {
      return cipherText;
    }
    const algorithm = EasyAes.getCipher(this._cipherId);
    const blockSize = EasyAes.getBlockSize(this._cipherId);
    let iv = decoded.slice(0, blockSize);
    let encrypted = decoded.slice(blockSize, len - (len % blockSize));
    let decipher = crypto.createDecipheriv(algorithm, this._password, iv);
    let decrypted;
    try {
      decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
    } catch(error) {
      // OpenSSL error may have occurred
      return cipherText;
    }
    return decrypted.toString('utf8');
  }

  _base64Decode(encodedText) {
    if (!encodedText.endsWith('==')) {
      return '';
    }
    return Buffer.from(encodedText, 'base64');
  }

  _base64Encode(buffer) {
    let newBuffer = buffer;
    if (buffer.length % 3 == 0) {
      newBuffer = Buffer.concat([buffer, crypto.randomBytes(1)]);
    } else if (buffer.length % 3 == 2) {
      newBuffer = Buffer.concat([buffer, crypto.randomBytes(2)]);
    }
    return newBuffer.toString('base64');
  }
}

module.exports = EasyAes;
