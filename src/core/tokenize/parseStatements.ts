import { Statement } from '.'
import { excludeUndefined } from '../../utils'

export const parseStatements = (code: string): Statement[] | never =>
  code
    .split('\n')
    .map((stmt: string): Statement | undefined => {
      const statement = stmt.replace(/;.*/, '').trim().toUpperCase()

      if (statement.length === 0) {
        return undefined
      }

      const firstWhitespacePos = statement.search(/\s/)
      if (firstWhitespacePos < 0) {
        return { key: statement, args: undefined }
      }

      const keyword = statement.slice(0, firstWhitespacePos)
      const args = statement.slice(firstWhitespacePos).replace(/\s/g, '')

      const commaPos = args.search(/,/)
      if (commaPos > 0) {
        const splitArgs = args.split(',')
        if (splitArgs.length > 2) {
          const rest = splitArgs.splice(2)
          throw new Error(
            `Redundant argument${rest.length > 1 ? 's' : ''} '${rest.join(
              ', '
            )}'`
          )
        }
        return { key: keyword, args: splitArgs as [string, string] }
      }

      return { key: keyword, args: [args] }
    })
    .filter(excludeUndefined)
