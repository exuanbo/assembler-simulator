import type { StatementWithLabels } from '.'
import { Instruction, INSTRUCTION_OPERANDS_COUNT_MAP } from '../constants'
import { excludeUndefined } from '../utils'

const isValidInstruction = (instruction: string): instruction is Instruction =>
  instruction in Instruction

export const parseStatements = (code: string): StatementWithLabels[] | never =>
  code
    .split('\n')
    .map((line): StatementWithLabels | undefined => {
      const statement = line.replace(/;.*/, '').trim().toUpperCase()

      if (statement.length === 0) {
        return undefined
      }

      if (statement.endsWith(':')) {
        return { instruction: statement, operands: null }
      }

      const firstWhitespace = statement.search(/\s/)

      const instruction = statement.slice(
        0,
        firstWhitespace === -1 ? statement.length : firstWhitespace
      )

      if (!isValidInstruction(instruction)) {
        throw new Error(`Invalid instruction ${instruction}`)
      }

      if (instruction === Instruction.END) {
        return { instruction, operands: null }
      }

      const operands = statement
        .slice(firstWhitespace)
        .replace(/\s/g, '')
        .split(',')
        .filter(operand => operand.length > 0)

      const operandsCount = operands.length

      if (operandsCount > 2) {
        throw new Error(`Got ${operandsCount} (> 2) operands`)
      }

      const expectedOperandsCount = INSTRUCTION_OPERANDS_COUNT_MAP[instruction]

      if (operandsCount !== expectedOperandsCount) {
        throw new Error(
          `Expect ${instruction} to have ${expectedOperandsCount} operand${
            expectedOperandsCount > 1 ? 's' : ''
          }, but got ${operandsCount}`
        )
      }

      return {
        instruction,
        operands: operandsCount > 1 ? [operands[0], operands[1]] : [operands[0]]
      }
    })
    .filter(excludeUndefined)
