// Simplified fork of tiny-invariant
// https://github.com/alexreardon/tiny-invariant/blob/619da0f9119558cd57aeff1ba5d022cad74f9bc7/src/tiny-invariant.ts
// MIT Licensed https://github.com/alexreardon/tiny-invariant/blob/619da0f9119558cd57aeff1ba5d022cad74f9bc7/LICENSE

const PREFIX = 'Invariant failed'

// istanbul ignore next
export function invariant(condition: unknown, message = ''): asserts condition {
  if (condition) {
    return
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(PREFIX)
  }
  throw new Error(PREFIX + `${message && `: ${message}`}`)
}
