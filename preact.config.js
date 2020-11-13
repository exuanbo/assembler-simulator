export default {
  webpack(config, env) {
    if (env.production) {
      config.performance.hints = false
    }
  }
}
