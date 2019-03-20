const ethUtil = require('ethereumjs-util');
const Transaction = require('ethereumjs-tx');
const { blockTagForPayload } = require('web3-provider-engine/util/rpc-cache-utils');
const Subprovider = require('./subprovider');

class NonceTrackerSubprovider extends Subprovider {
  constructor() {
    super();
    this.nonceCache = {};
    this.handleRequest = this.handleRequest.bind(this);
  }

  handleRequest(payload, next, end) {
    const self = this;
    let address;
    let blockTag;
    let cachedResult;
    switch (payload.method) {
      case 'eth_getTransactionCount':
        blockTag = blockTagForPayload(payload);
        address = payload.params[0].toLowerCase();
        cachedResult = self.nonceCache[address];
        if (blockTag === 'pending') {
          if (cachedResult) {
            end(null, cachedResult);
          } else {
            next((error, result, cb) => {
              if (error) return cb();
              if (self.nonceCache[address] === undefined) {
                self.nonceCache[address] = result;
              }
              return cb();
            });
          }
        } else {
          next();
        }
        return;
      case 'eth_sendRawTransaction':
        next((error, result, cb) => {
          if (error) {
            return cb();
          }
          const rawTx = payload.params[0].metaSignedTx;
          const tx = new Transaction(Buffer.from(ethUtil.stripHexPrefix(rawTx), 'hex'));
          address = `0x${tx.to.toString('hex')}`;
          let nonce = ethUtil.bufferToInt(tx.nonce);
          nonce += 1;
          let hexNonce = nonce.toString(16);
          if (hexNonce.length % 2) {
            hexNonce = `0${hexNonce}`;
          }
          hexNonce = `0x${hexNonce}`;
          self.nonceCache[address] = hexNonce;
          return cb();
        });
        return;
      default:
        next();
    }
  }
}

module.exports = NonceTrackerSubprovider;
