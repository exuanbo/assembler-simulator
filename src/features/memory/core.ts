import type { AddressToMachineCodeMap } from '../assembler/core'

export type MemoryData = number[]

export const initData = (): MemoryData =>
  Array.from({ length: 0x100 }, (_, address) => (address < 0xc0 ? 0 : 0x20))

export const initDataFrom = (map: AddressToMachineCodeMap): MemoryData => {
  const data = initData()
  for (const address in map) {
    data[Number.parseInt(address)] = map[address]
  }
  return data
}
