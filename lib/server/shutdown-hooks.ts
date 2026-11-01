/**
 * Node.js-only process shutdown handlers.
 *
 * Kept in a separate server-only module and dynamically imported from
 * instrumentation.ts so Turbopack's Edge Runtime compiler does not flag
 * `process.once` during static AST analysis.
 */
export function registerProcessShutdownHooks(onShutdown: () => void | Promise<void>): void {
  process.once('SIGTERM', () => void onShutdown());
  process.once('SIGINT', () => void onShutdown());
}
