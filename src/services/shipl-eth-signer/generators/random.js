const nacl = require('tweetnacl');

const Random = {};

Random.setProvider = (provider) => {
  Random.randomBytes = provider;
};

// eslint-disable-next-line no-multi-assign
Random.randomBytes = Random.naclRandom = (length, callback) => {
  callback(null, Buffer.from(nacl.randomBytes(length)));
};

module.exports = Random;
