import path from 'path'

export default {
  webpack(config, env, helpers) {
    config.output.publicPath = ''

    if (env.production === true) {
      config.devtool = false
      if (config.performance !== undefined) {
        config.performance.hints = false
      }
    }

    // Use any `index` file, not just index.js
    config.resolve.alias['preact-cli-entrypoint'] = path.resolve(
      process.cwd(),
      'src/index'
    )

    const balbelLoaderWrapper = helpers.getLoadersByName(
      config,
      'babel-loader'
    )[0]
    const babelConfig = balbelLoaderWrapper.rule.options

    babelConfig.plugins.push(require.resolve('styled-jsx/babel'))
  }
}
