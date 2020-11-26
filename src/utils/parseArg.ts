import {
  ArgType,
  ValidArgType,
  ARG_TYPE_REGEX,
  Register,
  RegisterCode,
  REGISTER_CODE
} from './constants'
import { omit } from './helper'

export const strToHex = (str: string): number => Number.parseInt(str, 16)

export const getRegisterCode = (registerName: string): RegisterCode =>
  REGISTER_CODE[registerName as Register]

export interface ParsedArg {
  type: ArgType
  value: number
}

export const getArgMatcher = (token: string) => (
  type: ValidArgType
): ParsedArg | undefined => {
  const regex = ARG_TYPE_REGEX[type]
  const matchResult = regex.exec(token)?.[1]
  if (matchResult !== undefined) {
    const value = (() => {
      switch (type) {
        case ArgType.Number:
        case ArgType.Address:
          return strToHex(matchResult)
        case ArgType.Register:
        case ArgType.RegisterPointer:
          return getRegisterCode(matchResult)
      }
    })() as number
    return {
      type,
      value
    }
  }
}

export const parseArg = (token: string): ParsedArg | never => {
  const matchArg = getArgMatcher(token)

  for (const argType of Object.values(omit(ArgType, 'Invalid'))) {
    const match = matchArg(argType)
    if (match !== undefined) {
      return match
    }
  }

  throw new Error(`Invalid argument '${token}'`)
}
