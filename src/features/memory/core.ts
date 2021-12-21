import type { AddressToMachineCodeMap, AddressToStatementMap } from '../assembler/core'
// TODO: OperandType should not be imported from here
import { OperandType } from '../assembler/core/parser'
import { Mnemonic } from '../../common/constants'

export type MemoryData = number[]

export const initData = (): MemoryData =>
  Array.from({ length: 0x100 }, (_, address) => (address < 0xc0 ? 0 : 0x20))

export const initDataFrom = (map: AddressToMachineCodeMap): MemoryData => {
  const data = initData()
  for (const address in map) {
    data[address] = map[address]
  }
  return data
}

export const getSourceFrom = (map: AddressToStatementMap): string[] => {
  const source: string[] = Array.from({ length: 0x100 }, (_, address) =>
    address < 0xc0 ? Mnemonic.END : ''
  )
  for (const address in map) {
    const addressNumber = Number.parseInt(address)
    const statement = map[address]
    const { instruction, operands } = statement
    if (instruction.mnemonic === Mnemonic.DB) {
      if (operands[0].type === OperandType.Number) {
        source[address] = operands[0].rawValue
      } else {
        operands[0].rawValue.split('').forEach((char, index) => {
          source[addressNumber + index] = char
        })
      }
    } else {
      source[address] = instruction.mnemonic
      const nextAddress = addressNumber + 1
      operands.forEach((operand, index) => {
        const { rawValue } = operand
        // TODO: Operand.rawValue should contain brackets
        source[nextAddress + index] = operand.type.endsWith('Address') ? `[${rawValue}]` : rawValue
      })
    }
  }
  return source
}
