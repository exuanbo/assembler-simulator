import path from 'path'

export default {
  webpack(config, env, helpers) {
    config.output.publicPath = ''

    if (env.production && config.performance) {
      config.performance.hints = false
    }

    /** https://github.com/preactjs/preact-cli/blob/master/packages/cli/lib/lib/webpack/webpack-base-config.js#L173 */
    const lessLoader = helpers
      .getLoadersByName(config, 'proxy-loader')
      .filter(
        loaderWrapper => loaderWrapper.loader.options.loader === 'less-loader'
      )[0].loader.options

    lessLoader.options.lessOptions.javascriptEnabled = true

    // Use any `index` file, not just index.js
    config.resolve.alias['preact-cli-entrypoint'] = path.resolve(
      process.cwd(),
      'src/index'
    )
  }
}
