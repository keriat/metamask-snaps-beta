import { permitted } from '@mm-snap/rpc-methods';
import handlers from './handlers';

const handlerMap = handlers.reduce((map, handler) => {
  for (const methodName of handler.methodNames) {
    map.set(methodName, handler.implementation);
  }
  return map;
}, new Map());

const pluginHandlerMap = permitted.reduce((map, handler) => {
  for (const methodName of handler.methodNames) {
    map.set(methodName, handler.implementation);
  }
  return map;
}, new Map());

/**
 * Returns a middleware that implements the RPC methods defined in the handlers
 * directory.
 *
 * The purpose of this middleware is to create portable RPC method
 * implementations that are decoupled from the rest of our background
 * architecture.
 *
 * Handlers consume functions that hook into the background, and only depend
 * on their signatures, not e.g. controller internals.
 *
 * Eventually, we'll want to extract this middleware into its own package.
 *
 * @param {Object} hooks - The middleware options
 * @param {Function} hooks.sendMetrics - A function for sending a metrics event
 * @returns {(req: Object, res: Object, next: Function, end: Function) => void}
 */
export function createMethodMiddleware(hooks) {
  return function methodMiddleware(req, res, next, end) {
    if (handlerMap.has(req.method)) {
      return handlerMap.get(req.method)(req, res, next, end, hooks);
    }
    return next();
  };
}

export function createPluginMethodMiddleware(hooks) {
  return function methodMiddleware(req, res, next, end) {
    if (pluginHandlerMap.has(req.method)) {
      return pluginHandlerMap.get(req.method)(req, res, next, end, hooks);
    }
    return next();
  };
}
