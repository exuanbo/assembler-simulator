import { ArgType, ARG_TYPE_REGEX, Register, REGISTER_CODE } from './constants'

export const strToHex = (str: string): number => Number.parseInt(str, 16)

export interface ParsedArg {
  type: ArgType
  value: number
}

export const getArgMatcher = (token: string) => (
  type: ArgType
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
          return REGISTER_CODE[matchResult as Register]
      }
    })()
    return {
      type,
      value
    }
  }
}

export const parseArg = (token: string): ParsedArg | never => {
  const matchArg = getArgMatcher(token)

  for (const argType of Object.values(ArgType)) {
    const match = matchArg(argType)
    if (match !== undefined) {
      return match
    }
  }

  throw new Error(`Invalid argument ${token}`)
}
