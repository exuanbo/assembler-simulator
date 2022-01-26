import type { AddressToMachineCodeMap, AddressToStatementMap } from '@/features/assembler/core'
import { Mnemonic, SPACE_ASCII } from '@/common/constants'

export const MEMORY_SIZE = 0x100

export const VDU_START_ADDRESS = 0xc0

type VduData = number[]

export const initVduData = (): VduData =>
  new Array<number>(MEMORY_SIZE - VDU_START_ADDRESS).fill(SPACE_ASCII)

export type MemoryData = number[]

export const initData = (): MemoryData =>
  new Array<number>(VDU_START_ADDRESS).fill(0).concat(initVduData())

export const initDataFrom = (map: AddressToMachineCodeMap): MemoryData => {
  const data = initData()
  for (const address in map) {
    data[address] = map[address]
  }
  return data
}

export const getSourceFrom = (map: AddressToStatementMap): string[] => {
  const source: string[] = Array.from({ length: MEMORY_SIZE }, (_, address) =>
    address < VDU_START_ADDRESS ? Mnemonic.END : ''
  )
  for (const address in map) {
    const addressNumber = Number.parseInt(address)
    const statement = map[address]
    const { instruction, operands } = statement
    if (instruction.mnemonic === Mnemonic.DB) {
      const operand = operands[0]
      // OperandType.Number
      if (typeof operand.value === 'number') {
        source[address] = operand.rawValue
      } else {
        // OperandType.String
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
