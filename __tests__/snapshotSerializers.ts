import { decToHex, chunk } from '@/common/utils'

const SEPARATOR = ', '

const isArrayOf =
  <T = unknown>(...types: string[]) =>
  (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(el => types.includes(typeof el))

export const shortArraySerializer: jest.SnapshotSerializerPlugin = {
  test: value => isArrayOf('number', 'boolean')(value) && value.length <= 4,
  serialize: (arr: Array<number | boolean>) =>
    `[${arr.join(SEPARATOR)}${arr.length > 0 ? ',' : ''}]`
}

export const memoryDataSerializer: jest.SnapshotSerializerPlugin = {
  test: value => isArrayOf('number', 'string')(value) && value.length % 0x10 === 0,
  serialize: (arr: Array<number | string>, _config, indentation) => `[
${chunk(0x10, arr)
  .map(
    row =>
      `${indentation}${' '.repeat(2)}${row
        .map(value => (typeof value === 'number' ? decToHex(value) : value))
        .join(SEPARATOR)}`
  )
  .join(',\n')},
${indentation}]`
}
