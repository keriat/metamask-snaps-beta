
const createAsyncMiddleware = require('json-rpc-engine/src/createAsyncMiddleware')
const { ethErrors } = require('eth-json-rpc-errors')

/**
 * Create middleware for preprocessing permissions requests.
 */
module.exports = function createRequestMiddleware ({
  internalPrefix, store, storeKey, getAccounts
}) {
  return createAsyncMiddleware(async (req, res, next) => {

    if (typeof req.method !== 'string') {
      res.error = ethErrors.rpc.invalidRequest({ data: req})
      return
    }

    // intercepting eth_accounts requests for backwards compatibility
    if (req.method === 'eth_accounts') {
      res.result = await getAccounts(req.origin)
      return
    }

    if (req.method.startsWith(internalPrefix)) {
      switch (req.method.split(internalPrefix)[1]) {
        case 'sendSiteMetadata':
          if (
            req.siteMetadata &&
            typeof req.siteMetadata.name === 'string'
          ) {
            store.updateState({
              [storeKey]: {
                ...store.getState()[storeKey],
                [req.origin]: req.siteMetadata,
              },
            })
          }
          res.result = true
          return
        default:
          break
      }
    }

    next()
  })
}
