import { parseOperand } from './parseOperand'
import { getOpcode } from './getOpcode'
import type { Statement, TokenizeResult } from '../tokenize'
import { Instruction } from '../constants'
import { excludeUndefined } from '../utils'

export const generateAddressArr = (withVDU: boolean): Uint8Array =>
  new Uint8Array(0x100).map((_, index) =>
    withVDU && index >= 0xc0 ? 0x20 : 0x00
  )

export const getOpcodesFromStatemet = (
  statement: Statement
): number[] | null => {
  const { instruction, operands } = statement
  if (instruction === Instruction.END) {
    return [0x00]
  }

  if (operands !== null) {
    const [operand1, operand2] = operands
    const parsedOperand1 = parseOperand(operand1)
    const parsedOperand2 =
      (operand2 !== undefined && parseOperand(operand2)) || undefined

    const opcode = getOpcode(instruction, parsedOperand1, parsedOperand2)

    return [opcode, parsedOperand1.value, parsedOperand2?.value].filter(
      excludeUndefined
    )
  }

  return null
}

export const assemble = (tokenizedCode: TokenizeResult): Uint8Array | never => {
  const address = generateAddressArr(true)
  let addressIndex = 0

  tokenizedCode.statements.forEach(statement => {
    const opcodes = getOpcodesFromStatemet(statement)
    if (opcodes !== null) {
      opcodes.forEach(opcode => {
        address[addressIndex] = opcode
        addressIndex++
      })
    }
  })

  return address
}
