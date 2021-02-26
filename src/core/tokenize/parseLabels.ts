import type {
  StatementWithLabels,
  Statement,
  LabelTuple,
  TokenizeResult
} from '.'
import { excludeUndefined, decToHex } from '../utils'
import { Instruction } from '../constants'

export const getCurrentStatementAddress = (
  currentIndex: number,
  statements: StatementWithLabels[]
): number =>
  statements
    .slice(0, currentIndex)
    .map(statement => 1 + (statement.operands?.length ?? 0))
    .reduce((acc, cur) => acc + cur)

interface JumpStatement extends Statement {
  operands: [string]
}

const isJumpStatement = (statement: Statement): statement is JumpStatement =>
  [Instruction.JMP, Instruction.JZ, Instruction.JNZ].some(
    instruction => statement.instruction === instruction
  )

export const setLabelValue = (
  labelTuples: LabelTuple[],
  statements: Statement[]
): Statement[] =>
  statements.map((statement, statementIndex) => {
    if (isJumpStatement(statement)) {
      labelTuples.forEach(([labelName, labelAddress]) => {
        if (statement.operands[0] === labelName) {
          const statementAddress = getCurrentStatementAddress(
            statementIndex,
            statements
          )
          const relativeDistance = labelAddress - statementAddress
          const absoluteDistance =
            relativeDistance > 0 ? relativeDistance : 0x100 + relativeDistance
          const labelValue = decToHex(absoluteDistance)

          statement.operands = [labelValue]
        }
      })
    }

    return statement
  })

const isValidStatement = (
  statement: StatementWithLabels
): statement is Statement => !statement.instruction.endsWith(':')

export const parseLabels = (
  statements: StatementWithLabels[]
): TokenizeResult => {
  let labelsCount = 0

  const labelTuples = statements
    .map((statement, statementIndex): LabelTuple | undefined => {
      if (!isValidStatement(statement)) {
        const labelAddress =
          getCurrentStatementAddress(statementIndex, statements) - labelsCount

        labelsCount++

        return [statement.instruction.slice(0, -1), labelAddress]
      }

      return undefined
    })
    .filter(excludeUndefined)

  const validStatements = statements.filter(isValidStatement)

  const resultStatements = setLabelValue(labelTuples, validStatements)

  return {
    statements: resultStatements,
    labelTuples
  }
}
