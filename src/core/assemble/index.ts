import { parseArg } from './parseArg'
import { getOpcode } from './getOpcode'
import type { Statement, TokenizeResult } from '../tokenize'
import { Instruction } from '../constants'
import { excludeUndefined } from '../utils'

export const generateAddressArr = (withVDU: boolean): Uint8Array =>
  new Uint8Array(0x100).map((_, index) =>
    withVDU && index >= 0xc0 ? 0x20 : 0x00
  )

export const generateOpcodesFromStatement = (
  statement: Statement
): number[] | undefined => {
  const { instruction, args } = statement
  if (instruction === Instruction.END) {
    return [0x00]
  }

  if (args !== undefined) {
    const [arg1, arg2] = args
    const parsedArg1 = parseArg(arg1)
    const parsedArg2 = (arg2 !== undefined && parseArg(arg2)) || undefined

    const opcode = getOpcode(instruction, parsedArg1, parsedArg2)

    return [
      opcode,
      parsedArg1.value as number,
      parsedArg2?.value as number
    ].filter(excludeUndefined)
  }

  return undefined
}

export const assemble = (tokenizedCode: TokenizeResult): Uint8Array | never => {
  const { statements } = tokenizedCode

  const address = generateAddressArr(true)
  let addressPos = 0

  statements.forEach(statement => {
    const opcodes = generateOpcodesFromStatement(statement)
    if (opcodes !== undefined) {
      opcodes.forEach(opcode => {
        address[addressPos] = opcode
        addressPos++
      })
    }
  })

  return address
}
