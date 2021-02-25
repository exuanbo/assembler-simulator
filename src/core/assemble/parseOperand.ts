import {
  OperandType,
  OPERAND_TYPE_REGEX_MAP,
  Register,
  REGISTER_CODE_MAP
} from '../constants'

export interface Operand {
  type: OperandType
  value: number
}

export const getOperandMatcher = (token: string) => (
  type: OperandType
): Operand | null => {
  const regex = OPERAND_TYPE_REGEX_MAP[type]
  const matchResult = regex.exec(token)?.[1]

  if (matchResult !== undefined) {
    const value = (() => {
      switch (type) {
        case OperandType.Number:
        case OperandType.Address:
          return Number.parseInt(matchResult, 16)
        case OperandType.Register:
        case OperandType.RegisterPointer:
          return REGISTER_CODE_MAP[matchResult as Register]
      }
    })()

    return {
      type,
      value
    }
  }

  return null
}

export const parseOperand = (token: string): Operand | never => {
  const matchOperand = getOperandMatcher(token)

  for (const operandType of Object.values(OperandType)) {
    const match = matchOperand(operandType)
    if (match !== null) {
      return match
    }
  }

  throw new Error(`Invalid operand ${token}`)
}
