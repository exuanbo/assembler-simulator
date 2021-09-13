import type { AddressToMachineCodeMap } from '../assembler/core'

export const initData = (): number[] =>
  Array.from({ length: 0x100 }, (_, address) => (address < 0xc0 ? 0 : 0x20))

export const initDataFrom = (map: AddressToMachineCodeMap): number[] => {
  const data = initData()
  Object.entries(map).forEach(([address, machineCode]) => {
    data[Number.parseInt(address)] = machineCode
  })
  return data
}
