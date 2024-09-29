// @ts-check

/** @import * as Rollup from 'rollup' */
/** @import * as Vite from 'vite' */

export {}

/**
 * @returns {Vite.Plugin}
 */
export default function splitVendorChunk() {
  return {
    name: 'split-vendor-chunk',
    config() {
      return {
        build: {
          rollupOptions: {
            output: { manualChunks },
          },
        },
      }
    },
  }
}

/**
 * @type {Rollup.GetManualChunk}
 */
const manualChunks = (id, { getModuleInfo }) => {
  if (
    isInNodeModules(id)
    && !isCSSRequest(id)
    && isStaticImported(id)) {
    return 'vendor'
  }

  /**
   * @param {string} moduleId
   * @param {string[]} importStack
   * @returns {boolean}
   */
  function isStaticImported(moduleId, importStack = []) {
    if (importStack.includes(moduleId)) {
      return false
    }
    const moduleInfo = getModuleInfo(moduleId)
    if (!moduleInfo) {
      return false
    }
    if (moduleInfo.isEntry) {
      return true
    }
    return moduleInfo.importers.some((importerId) =>
      isStaticImported(importerId, importStack.concat(moduleId)))
  }
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isInNodeModules(id) {
  return id.includes('node_modules')
}

/**
 * @param {string} request
 * @returns {boolean}
 */
function isCSSRequest(request) {
  return CSS_LANGS_RE.test(request)
}

const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/
