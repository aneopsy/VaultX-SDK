const util = require('ethereumjs-util');
const Random = require('./random');

const { secp256k1 } = util;

function hex0x(buffer) {
  return util.addHexPrefix(buffer.toString('hex'));
}

function fromPrivateKey(privateKey) {
  if (!Buffer.isBuffer(privateKey)) {
    // eslint-disable-next-line no-param-reassign
    privateKey = Buffer.from(privateKey, 'hex');
  }

  const publicKey = util.privateToPublic(privateKey);
  return {
    privateKey: hex0x(privateKey),
    publicKey: hex0x(publicKey),
    address: hex0x(util.pubToAddress(publicKey)),
  };
}

function generate(callback) {
  if (!Random.randomBytes) {
    Random.randomBytes = Random.naclRandom;
  }
  Random.randomBytes(32, (error, rand) => {
    if (error) { return callback(error, null); }
    if (secp256k1.privateKeyVerify(rand)) {
      const privateKey = Buffer.from(rand);
      return callback(null, fromPrivateKey(privateKey));
    }
    return generate(callback);
  });
}

const KeyPair = {
  generate,
  fromPrivateKey,
};

module.exports = KeyPair;
