const createPayload = require('web3-provider-engine/util/create-payload.js');

class Subprovider {
  setEngine(engine) {
    this.engine = engine;
    engine.on('block', (block) => {
      this.currentBlock = block;
    });
  }

  // FIXME: make it static
  // eslint-disable-next-line no-unused-vars
  static handleRequest(payload, next, end) {
    throw new Error('Subproviders should override `handleRequest`.');
  }

  emitPayload(payload, cb) {
    this.engine.sendAsync(createPayload(payload), cb);
  }
}

module.exports = Subprovider;
