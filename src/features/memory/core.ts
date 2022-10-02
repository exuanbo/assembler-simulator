import type { AddressToMachineCodeMap, AddressToStatementMap } from '@/features/assembler/core'
import { Ascii, Mnemonic } from '@/common/constants'

export type MemoryData = number[]

const MEMORY_SIZE = 0x100

export const VDU_START_ADDRESS = 0xc0

export const initVduData = (): number[] =>
  new Array<number>(MEMORY_SIZE - VDU_START_ADDRESS).fill(Ascii.Space)

export const initData = (): MemoryData =>
  new Array<number>(VDU_START_ADDRESS).fill(0).concat(initVduData())

export const initDataFrom = (map: AddressToMachineCodeMap): MemoryData => {
  const data = initData()
  for (const address in map) {
    data[address] = map[address]
  }
  return data
}

export const getVduDataFrom = (data: MemoryData): number[] => data.slice(VDU_START_ADDRESS)

export const getSourceFrom = (map: Partial<AddressToStatementMap>): string[] => {
  const source: string[] = []
  for (let address = 0; address < MEMORY_SIZE; address++) {
    source.push(address < VDU_START_ADDRESS ? Mnemonic.END : '')
  }
  for (const address in map) {
    const statement = map[address]
    // istanbul ignore next
    if (statement === undefined) {
      continue
    }
    const { instruction, operands } = statement
    if (instruction.mnemonic === Mnemonic.DB) {
      const operand = operands[0]
      // OperandType.Number
      if (typeof operand.value === 'number') {
        source[address] = operand.rawValue
      } else {
        // OperandType.String
        operand.rawValue.split('').forEach((char, charIndex) => {
          source[Number(address) + charIndex] = char
        })
      }
    } else {
      source[address] = instruction.mnemonic
      const nextAddress = Number(address) + 1
      operands.forEach((operand, operandIndex) => {
        const { rawValue } = operand
        // Address or RegisterAddress
        const isAddressOperand = operand.type.endsWith('Address')
        source[nextAddress + operandIndex] = isAddressOperand ? `[${rawValue}]` : rawValue
      })
    }
  }
  return source
}
