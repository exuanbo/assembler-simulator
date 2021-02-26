import type { StatementWithLabels, Statement, Label, TokenizeResult } from '.'
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
  labels: Label[],
  statements: Statement[]
): Statement[] =>
  statements.map((statement, statementIndex) => {
    if (isJumpStatement(statement)) {
      labels.forEach(label => {
        if (statement.operands[0] === label.name) {
          const statementAddress = getCurrentStatementAddress(
            statementIndex,
            statements
          )
          const relativeDistance = label.address - statementAddress
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

  const labels = statements
    .map((statement, statementIndex): Label | undefined => {
      if (!isValidStatement(statement)) {
        const labelAddress =
          getCurrentStatementAddress(statementIndex, statements) - labelsCount

        labelsCount++

        return {
          name: statement.instruction.slice(0, -1),
          address: labelAddress
        }
      }

      return undefined
    })
    .filter(excludeUndefined)

  const validStatements = statements.filter(isValidStatement)

  const resultStatements = setLabelValue(labels, validStatements)

  return {
    statements: resultStatements,
    labels
  }
}
