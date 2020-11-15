import { ArgType, Register, REGISTER_CODES, REGEX } from './constants'

export const strToHex = (str: string): number => Number.parseInt(str, 16)

export const getRegisterCode = (registerName: string): number =>
  REGISTER_CODES[registerName.toUpperCase() as Register]

export interface ParsedArg {
  type: ArgType
  value: number | null
}

type MatcherResult = ParsedArg | undefined

const getMatcher = (token: string) => (
  regex: RegExp,
  type: ArgType
): MatcherResult => {
  const match = token.match(regex)?.[1]
  if (match !== undefined) {
    const getValue =
      type === 'Number' || type === 'Address' ? strToHex : getRegisterCode
    return {
      type,
      value: getValue(match)
    }
  }
}

export const parseArg = (token: string): ParsedArg => {
  const matcher = getMatcher(token)

  const matchNumber = matcher(REGEX.Number, 'Number')
  if (matchNumber !== undefined) {
    return matchNumber
  }

  const matchAddress = matcher(REGEX.Address, 'Address')
  if (matchAddress !== undefined) {
    return matchAddress
  }

  const matchRegister = matcher(REGEX.Register, 'Register')
  if (matchRegister !== undefined) {
    return matchRegister
  }

  const matchRegisterPointer = matcher(REGEX.RegisterPointer, 'RegisterPointer')
  if (matchRegisterPointer !== undefined) {
    return matchRegisterPointer
  }

  return {
    type: 'Illegal',
    value: null
  }
}
