import type { AddressToMachineCodeMap } from './assembler'

export const initMemory = (): number[] =>
  [...Array(0x100)].map((_, address) => (address < 0xc0 ? 0 : 0x20))

export const initMemoryFrom = (map: AddressToMachineCodeMap): number[] => {
  const memory = initMemory()
  map.forEach((machineCode, address) => {
    memory[address] = machineCode
  })
  return memory
}
