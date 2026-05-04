const { TestEnvironment } = require('jest-environment-jsdom');
const { TextEncoder, TextDecoder } = require('util');

class CustomTestEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    this.customExportConditions = ['node', 'node-addons', 'require', 'default'];
  }

  async setup() {
    await super.setup();

    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = TextEncoder;
    }
    if (typeof this.global.TextDecoder === 'undefined') {
      this.global.TextDecoder = TextDecoder;
    }
    if (typeof this.global.Response === 'undefined' && typeof Response !== 'undefined') {
      this.global.Response = Response;
    }
    if (typeof this.global.Request === 'undefined' && typeof Request !== 'undefined') {
      this.global.Request = Request;
    }
    if (typeof this.global.Headers === 'undefined' && typeof Headers !== 'undefined') {
      this.global.Headers = Headers;
    }
    if (typeof this.global.fetch === 'undefined' && typeof fetch !== 'undefined') {
      this.global.fetch = fetch;
    }
  }
}

module.exports = CustomTestEnvironment;
