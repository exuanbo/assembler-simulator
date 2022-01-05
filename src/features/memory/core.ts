import type { AddressToMachineCodeMap, AddressToStatementMap } from '../assembler/core'
import { Mnemonic } from '../../common/constants'

export type MemoryData = number[]

export const VDU_START_ADDRESS = 0xc0

export const initData = (): MemoryData =>
  Array.from({ length: 0x100 }, (_, address) => (address < VDU_START_ADDRESS ? 0 : 0x20))

export const initDataFrom = (map: AddressToMachineCodeMap): MemoryData => {
  const data = initData()
  for (const address in map) {
    data[address] = map[address]
  }
  return data
}

export const getSourceFrom = (map: AddressToStatementMap): string[] => {
  const source: string[] = Array.from({ length: 0x100 }, (_, address) =>
    address < VDU_START_ADDRESS ? Mnemonic.END : ''
  )
  for (const address in map) {
    const addressNumber = Number.parseInt(address)
    const statement = map[address]
    const { instruction, operands } = statement
    if (instruction.mnemonic === Mnemonic.DB) {
      const operand = operands[0]
      // if (operand.type === OperandType.Number)
      if (typeof operand.value === 'number') {
        source[address] = operand.rawValue
      } else {
        // if (operand.type === OperandType.String)
        operand.rawValue.split('').forEach((char, index) => {
          source[addressNumber + index] = char
        })
      }
    } else {
      source[address] = instruction.mnemonic
      const nextAddress = addressNumber + 1
      operands.forEach((operand, index) => {
        const { rawValue } = operand
        // Address or RegisterAddress
        source[nextAddress + index] = operand.type.endsWith('Address') ? `[${rawValue}]` : rawValue
      })
    }
  }
  return source
}
