import type { StatementWithLabels } from '.'
import { Instruction, ARGS_COUNT } from '../constants'
import { excludeUndefined } from '../utils'

export const parseStatements = (code: string): StatementWithLabels[] | never =>
  code
    .split('\n')
    .map((stmt: string): StatementWithLabels | undefined => {
      const statement = stmt.replace(/;.*/, '').trim().toUpperCase()

      if (statement.length === 0) {
        return undefined
      }

      if (statement.endsWith(':')) {
        return { instruction: statement, args: undefined }
      }

      const firstWhitespace = statement.search(/\s/)

      const instruction = statement.slice(
        0,
        firstWhitespace === -1 ? statement.length : firstWhitespace
      )

      if (!(instruction in Instruction)) {
        throw new Error(`Invalid instruction ${instruction}`)
      }

      if (instruction === Instruction.END) {
        return { instruction, args: undefined }
      }

      const args = statement
        .slice(firstWhitespace)
        .replace(/\s/g, '')
        .split(',')
        .filter(arg => arg !== '')

      const argsCount = args.length

      if (argsCount > 2) {
        const rest = args.splice(2)
        throw new Error(
          `Redundant argument${rest.length > 1 ? 's' : ''} ${rest.join(', ')}`
        )
      }

      const expectedArgsCount = ARGS_COUNT[instruction as Instruction]

      if (argsCount !== expectedArgsCount) {
        throw new Error(
          `Expect ${instruction} to have ${expectedArgsCount} argument${
            expectedArgsCount > 1 ? 's' : ''
          }. Got ${argsCount}`
        )
      }

      return {
        instruction,
        args: argsCount > 1 ? [args[0], args[1]] : [args[0]]
      }
    })
    .filter(excludeUndefined)
