import type { AddressToMachineCodeMap } from '../assembler/core'

export const initMemory = (): number[] =>
  [...Array(0x100)].map((_, address) => (address < 0xc0 ? 0 : 0x20))

export const initMemoryFrom = (map: AddressToMachineCodeMap): number[] => {
  const memory = initMemory()
  Object.entries(map).forEach(([address, machineCode]) => {
    memory[Number.parseInt(address)] = machineCode
  })
  return memory
}
