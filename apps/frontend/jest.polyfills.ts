// Polyfills required by MSW v2 in jsdom environment.
// Must run in setupFiles (before test env) so globals exist when modules load.
import { TextDecoder, TextEncoder } from 'util';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
import { Blob } from 'buffer';
import { BroadcastChannel } from 'worker_threads';

Object.defineProperty(globalThis, 'TextEncoder', { writable: true, value: TextEncoder });
Object.defineProperty(globalThis, 'TextDecoder', { writable: true, value: TextDecoder });
Object.defineProperty(globalThis, 'ReadableStream', { writable: true, value: ReadableStream });
Object.defineProperty(globalThis, 'TransformStream', { writable: true, value: TransformStream });
Object.defineProperty(globalThis, 'WritableStream', { writable: true, value: WritableStream });
Object.defineProperty(globalThis, 'Blob', { writable: true, value: Blob });
Object.defineProperty(globalThis, 'BroadcastChannel', { writable: true, value: BroadcastChannel });
