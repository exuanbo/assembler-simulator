import { getOpcodesFromStatemet } from './getOpcode'
import type { TokenizeResult } from '../tokenize'

export const generateAddressArr = (withVDU: boolean): Uint8Array =>
  new Uint8Array(0x100).map((_, index) =>
    withVDU && index >= 0xc0 ? 0x20 : 0x00
  )

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
