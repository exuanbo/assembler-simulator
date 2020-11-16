import { ParsedArg } from './parseArg'
import {
  Keyword,
  ArithmeticKeyword,
  ArgType,
  OPCODE_MAPPING
} from './constants'

export const generateAddressArr = (withVDU: boolean): number[] =>
  [...Array(0x100)].map((_, index) => (withVDU && index >= 0xc0 ? 0x20 : 0x00))

export const getArithmeticOpcode = (
  token: ArithmeticKeyword,
  dest: ParsedArg,
  src: ParsedArg
): number | undefined => {
  switch (dest.type) {
    case ArgType.Register:
      switch (src.type) {
        case ArgType.Register:
          return (OPCODE_MAPPING[token] as [number, number])[0]
        case ArgType.Number:
          return (OPCODE_MAPPING[token] as [number, number])[1]
      }
  }
}

type MovOpcode = 0xd0 | 0xd1 | 0xd3 | 0xd2 | 0xd4 | undefined

export const getMovOpcode = (dest: ParsedArg, src: ParsedArg): MovOpcode => {
  switch (dest.type) {
    case ArgType.Register:
      switch (src.type) {
        case ArgType.Number:
          return 0xd0
        case ArgType.Address:
          return 0xd1
        case ArgType.RegisterPointer:
          return 0xd3
      }
      break

    case ArgType.Address:
      if (src.type === ArgType.Register) {
        return 0xd2
      }
      break

    case ArgType.RegisterPointer:
      if (src.type === ArgType.Register) {
        return 0xd4
      }
  }
}

export const getOpcode = (
  token: Keyword,
  dest: ParsedArg,
  src: ParsedArg
): number | undefined => {
  switch (token) {
    case Keyword.MOV:
      return getMovOpcode(dest, src)
    case Keyword.ADD:
    case Keyword.SUB:
    case Keyword.MUL:
    case Keyword.DIV:
      return getArithmeticOpcode(token, dest, src)
  }
}
