// @ts-check

/** @import {Linter} from 'eslint' */

/**
 * @param {Partial<Linter.RulesRecord> | undefined} rules
 * @param {Linter.RulesRecord} record
 */
export function extendRules(rules, record) {
  if (!rules) {
    return record
  }

  /**
   * @param {string} name
   * @param {Linter.RuleEntry} entry
   */
  const extendRule = (name, entry) => {
    if (!Array.isArray(entry)) {
      return { [name]: entry }
    }
    const defaultEntry = rules[name]
    if (!Array.isArray(defaultEntry)) {
      return { [name]: entry }
    }
    const [, ...defaultOptions] = defaultEntry
    const [level, ...options] = entry
    const extendedOptions = options.map((option, i) => {
      if (typeof option !== 'object') {
        return option
      }
      const defaultOption = defaultOptions[i]
      if (typeof defaultOption !== 'object') {
        return option
      }
      return {
        ...defaultOption,
        ...option,
      }
    })
    /** @type {Linter.RuleEntry} */
    const extendedEntry = [level, ...extendedOptions]
    return { [name]: extendedEntry }
  }

  return Object.entries(record).reduce(
    (extendedRules, [name, entry]) =>
      ({ ...extendedRules, ...extendRule(name, entry) }),
    rules,
  )
}
