import { decToHex, splitArrayPerChunk } from '../src/common/utils'

const SEPARATOR = ', '

const isArrayOf =
  <T = unknown>(...types: string[]) =>
  (val: unknown): val is T[] =>
    Array.isArray(val) && val.every(el => types.includes(typeof el))

export const shortArraySerializer: jest.SnapshotSerializerPlugin = {
  test: val => isArrayOf('number', 'boolean')(val) && val.length <= 4,
  serialize: (val: Array<number | boolean>) => `Array [${val.join(SEPARATOR)}]`
}

export const memorySerializer: jest.SnapshotSerializerPlugin = {
  test: val => isArrayOf('number', 'string')(val) && val.length === 0x100,
  serialize: (val: Array<number | string>, _config, indentation) => `Array [
${splitArrayPerChunk(val, 0x10)
  .map(
    row =>
      `${indentation}${' '.repeat(2)}${row
        .map(value => (typeof value === 'number' ? decToHex(value) : value))
        .join(SEPARATOR)}`
  )
  .join(',\n')}
${indentation}]`
}
