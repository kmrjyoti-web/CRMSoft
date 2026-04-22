/**
 * Custom Jest environment that extends jest-environment-jsdom and:
 *
 * 1. Overrides `customExportConditions` to remove the default 'browser' condition,
 *    preventing MSW v2's @mswjs/interceptors from resolving to browser .mjs builds.
 *    MSW's node server requires Node.js CJS/ESM interceptors, not browser ones.
 *
 * 2. Copies Web API globals (Response, Request, Headers, fetch, TextEncoder,
 *    BroadcastChannel, etc.) from the Node.js runtime into the jsdom window,
 *    since jsdom does not fully implement these natively.
 */

const { TestEnvironment } = require('jest-environment-jsdom');
const { TextEncoder, TextDecoder } = require('util');

class CustomTestEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    // Override export conditions: remove 'browser' so that packages with both
    // browser and node exports (like @mswjs/interceptors) resolve to the node build.
    this.customExportConditions = ['node', 'node-addons', 'require', 'default'];
  }

  async setup() {
    await super.setup();

    // TextEncoder / TextDecoder — needed by @mswjs/interceptors bufferUtils
    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = TextEncoder;
    }
    if (typeof this.global.TextDecoder === 'undefined') {
      this.global.TextDecoder = TextDecoder;
    }

    // Fetch API globals — needed by MSW v2 interceptors
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

    // Streams — may be needed by MSW for response body handling
    if (typeof this.global.ReadableStream === 'undefined' && typeof ReadableStream !== 'undefined') {
      this.global.ReadableStream = ReadableStream;
    }
    if (typeof this.global.WritableStream === 'undefined' && typeof WritableStream !== 'undefined') {
      this.global.WritableStream = WritableStream;
    }
    if (typeof this.global.TransformStream === 'undefined' && typeof TransformStream !== 'undefined') {
      this.global.TransformStream = TransformStream;
    }

    // BroadcastChannel — needed by MSW v2 for WebSocket support (ws.ts)
    if (typeof this.global.BroadcastChannel === 'undefined' && typeof BroadcastChannel !== 'undefined') {
      this.global.BroadcastChannel = BroadcastChannel;
    }
  }
}

module.exports = CustomTestEnvironment;
