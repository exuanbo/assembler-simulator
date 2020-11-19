import path from 'path'

export default {
  webpack(config, env, helpers) {
    config.output.publicPath = ''

    if (env.production && config.performance) {
      config.performance.hints = false
    }

    // Use any `index` file, not just index.js
    config.resolve.alias['preact-cli-entrypoint'] = path.resolve(
      process.cwd(),
      'src/index'
    )
  }
}
