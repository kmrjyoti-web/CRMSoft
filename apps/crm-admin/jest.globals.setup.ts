// Polyfill Web API globals required by MSW v2 in jsdom environment.
// Node.js 18+ has these natively available. jsdom may not expose them as globals.
// This file runs via jest setupFiles (before the test framework) to ensure globals exist.

// Use Node.js built-in fetch globals (available since Node 18)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeGlobal = global as any;

if (typeof nodeGlobal.Response === 'undefined') {
  // Node.js 18+ exposes these on the global scope directly
  // We re-assign from the global object itself (they exist in Node process scope)
  // but may not be assigned to jest's synthetic global
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Response, Request, Headers, fetch: nodeFetch } =
      // Node 18+ built-in fetch (experimental) or use globalThis
      (globalThis as any);

    if (Response) nodeGlobal.Response = Response;
    if (Request) nodeGlobal.Request = Request;
    if (Headers) nodeGlobal.Headers = Headers;
    if (nodeFetch) nodeGlobal.fetch = nodeFetch;
  } catch {
    // If not available, tests requiring MSW will fail with a clear message
  }
}
