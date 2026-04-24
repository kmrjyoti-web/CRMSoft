/**
 * Polyfills for Web Fetch API globals required by MSW v2 in jest-environment-jsdom.
 *
 * jest-environment-jsdom replaces `global` with the jsdom window, which does not
 * implement the full Fetch API (no Response, Request, Headers, fetch).
 * Node.js 18+ provides these natively. We copy them from Node's global scope
 * into the jest test `global` so MSW can load its interceptors successfully.
 *
 * This file is listed under `setupFiles` in jest.config.ts so it runs before
 * setupFilesAfterEnv (and before any module imports in jest.setup.ts).
 */

// In jest workers, `global` is the jsdom window, but we can still access
// Node.js's original globals via the following approach:
// - Capture references before jest replaces the global object
// - Or access via Object.getPrototypeOf chains

// The Node.js fetch globals are set on globalThis by the Node runtime.
// In the jest worker, require() is in the Node context, so `require` closures
// have access to the real process global. We use an eval trick to bypass
// the jest global replacement:

const { Response, Request, Headers, fetch } = (function () {
  // Function.prototype.constructor is Function; calling it creates code in the
  // "real" context. Using indirect eval accesses the actual global (Node.js
  // process global), NOT the jest-reassigned global.
  // eslint-disable-next-line no-new-func
  return (0, eval)('({ Response, Request, Headers, fetch })');
})();

if (typeof global.Response === 'undefined' && typeof Response !== 'undefined') {
  global.Response = Response;
}
if (typeof global.Request === 'undefined' && typeof Request !== 'undefined') {
  global.Request = Request;
}
if (typeof global.Headers === 'undefined' && typeof Headers !== 'undefined') {
  global.Headers = Headers;
}
if (typeof global.fetch === 'undefined' && typeof fetch !== 'undefined') {
  global.fetch = fetch;
}
