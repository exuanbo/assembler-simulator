// @ts-check

/** @import * as Vite from 'vite' */

import { createRequire } from 'node:module'
import { join } from 'node:path'

import { isCSSRequest } from 'vite'

/**
 * Modified from Vite deprecated splitVendorChunk plugin
 * @see {@link https://github.com/vitejs/vite/blob/3f337c5e24504e51188d29c970de1416ee523dbb/packages/vite/src/node/plugins/splitVendorChunk.ts}
 * @license {@link https://github.com/vitejs/vite/blob/main/LICENSE | MIT}
 *
 * @returns {Vite.Plugin}
 */
export default function splitVendorChunk() {
  const frameworkPaths = getTopLevelFrameworkPaths(['react', 'react-dom'])

  /**
   * @type {Vite.Rollup.GetManualChunk}
   */
  const manualChunks = (id, { getModuleInfo }) => {
    if (
      !isCSSRequest(id)
      && isInNodeModules(id)
      && isStaticImported(id)) {
      if (frameworkPaths.some((path) => id.startsWith(path))) {
        return 'framework'
      }
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
 * @param {string} id
 * @returns {boolean}
 */
function isInNodeModules(id) {
  return id.includes('node_modules')
}

/**
 * Modified from Sukka's webpack config
 * @see {@link https://blog.skk.moe/post/webpack-react-without-create-react-app/#splitChunks}
 * @license {@link https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh | CC BY-NC-SA 4.0}
 *
 * @param {string[]} packages
 * @param {string=} directory
 * @returns {string[]}
 */
function getTopLevelFrameworkPaths(packages, directory = import.meta.dirname) {
  const require = createRequire(import.meta.url)

  /** @type {string[]} */
  const toplevelPaths = []

  /** @type {Set<string>} */
  const visitedPackages = new Set()

  /**
   * @param {string} packageName
   * @param {string} relativePath
   */
  function addPath(packageName, relativePath) {
    try {
      if (visitedPackages.has(packageName)) {
        return
      }
      visitedPackages.add(packageName)

      const packageJsonPath = require.resolve(`${packageName}/package.json`, {
        paths: [relativePath],
      })

      const packagePath = join(packageJsonPath, '../')
      if (toplevelPaths.includes(packagePath)) {
        return
      }
      toplevelPaths.push(packagePath)

      const { dependencies } = require(packageJsonPath)
      if (dependencies) {
        Object.keys(dependencies).forEach((dependencyName) => {
          addPath(dependencyName, packagePath)
        })
      }
    }
    catch {
      // ignore
    }
  }

  packages.forEach((packageName) => {
    addPath(packageName, directory)
  })

  return toplevelPaths
}
