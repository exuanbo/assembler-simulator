import { Statement, LabelTuple, TokenizeResult } from '.'
import { excludeUndefined, decToHex } from '../../utils'
import { JumpKeyword } from '../constants'

const isLabel = (statement: Statement): boolean =>
  statement.key.endsWith(':') && statement.args === undefined

export const calcAddress = (index: number, statements: Statement[]): number =>
  statements
    .slice(0, index)
    .map(s => (s.args?.length ?? 0) + 1)
    .reduce((acc, cur) => acc + cur)

export const calcLabelValueInStatements = (
  labelTuples: LabelTuple[],
  statements: Statement[]
): Statement[] =>
  statements.map((statement, index) => {
    labelTuples.forEach(([label, labelAddress]) => {
      const { key, args } = statement
      if (key in JumpKeyword && args?.length === 1 && args[0] === label) {
        const statementAddress = calcAddress(index, statements)
        const relDistance = labelAddress - statementAddress
        const absDistance = relDistance > 0 ? relDistance : 0x100 + relDistance
        const labelValue = decToHex(absDistance)
        statement.args = [labelValue]
      }
    })
    return statement
  })

export const parseLables = (statements: Statement[]): TokenizeResult => {
  let labelsCount = 0

  const labelTuples = statements
    .map((statement, index): LabelTuple | undefined => {
      if (isLabel(statement)) {
        const labelAddress = calcAddress(index, statements) - labelsCount
        labelsCount++
        return [statement.key.slice(0, -1), labelAddress]
      }
      return undefined
    })
    .filter(excludeUndefined)

  const filteredStatements = statements
    .map(statement => (isLabel(statement) ? undefined : statement))
    .filter(excludeUndefined)

  const resultStatements = calcLabelValueInStatements(
    labelTuples,
    filteredStatements
  )

  return {
    statements: resultStatements,
    labelTuples
  }
}
