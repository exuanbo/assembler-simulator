import { decToHex, splitArrayPerChunk } from '../src/common/utils'

const SEPARATOR = ', '

const isArrayOfNumbers = (val: unknown): val is number[] =>
  Array.isArray(val) && val.every(el => typeof el === 'number')

export const shortArrayOfNumbersSerializer: jest.SnapshotSerializerPlugin = {
  test: val => isArrayOfNumbers(val) && val.length <= 4,
  serialize: val => `Array [${val.join(SEPARATOR)}]`
}

export const memorySerializer: jest.SnapshotSerializerPlugin = {
  test: val => isArrayOfNumbers(val) && val.length === 0x100,
  serialize: (val, _config, indentation) => `Array [
${splitArrayPerChunk(val, 0x10)
  .map(row => indentation + ' '.repeat(2) + row.map(num => decToHex(num)).join(SEPARATOR))
  .join('\n')}
${indentation}]`
}
