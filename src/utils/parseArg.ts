import {
  ArgType,
  Register,
  RegisterCode,
  ARG_TYPE_REGEX,
  REGISTER_CODE
} from './constants'

export const strToHex = (str: string): number => Number.parseInt(str, 16)

export const getRegisterCode = (registerName: string): RegisterCode =>
  REGISTER_CODE[registerName.toUpperCase() as Register]

export interface ParsedArg {
  type: ArgType
  value: number | string
}

const getMatcher = (token: string) => (
  regex: RegExp,
  type: ArgType
): ParsedArg | undefined => {
  const match = regex.exec(token)?.[1]
  if (match !== undefined) {
    const getValue =
      type === ArgType.Number || type === ArgType.Address
        ? strToHex
        : getRegisterCode
    return {
      type,
      value: getValue(match)
    }
  }
}

export const parseArg = (token: string): ParsedArg => {
  const matcher = getMatcher(token)

  const matchNumber = matcher(ARG_TYPE_REGEX.Number, ArgType.Number)
  if (matchNumber !== undefined) {
    return matchNumber
  }

  const matchAddress = matcher(ARG_TYPE_REGEX.Address, ArgType.Address)
  if (matchAddress !== undefined) {
    return matchAddress
  }

  const matchRegister = matcher(ARG_TYPE_REGEX.Register, ArgType.Register)
  if (matchRegister !== undefined) {
    return matchRegister
  }

  const matchRegisterPointer = matcher(
    ARG_TYPE_REGEX.RegisterPointer,
    ArgType.RegisterPointer
  )
  if (matchRegisterPointer !== undefined) {
    return matchRegisterPointer
  }

  return {
    type: ArgType.Illegal,
    value: token
  }
}
