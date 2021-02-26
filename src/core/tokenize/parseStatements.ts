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

      const firstWhitespaceIndex = statement.search(/\s/)

      const instruction = statement.slice(
        0,
        firstWhitespaceIndex === -1 ? statement.length : firstWhitespaceIndex
      )

      if (!isValidInstruction(instruction)) {
        throw new Error(`Invalid instruction ${instruction}`)
      }

      const operands =
        firstWhitespaceIndex === -1
          ? null
          : statement.slice(firstWhitespaceIndex).replace(/\s/g, '').split(',')

      const operandsCount = operands?.length ?? 0

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
        operands:
          operands !== null
            ? operandsCount > 1
              ? [operands[0], operands[1]]
              : [operands[0]]
            : null
      }
    })
    .filter(excludeUndefined)
