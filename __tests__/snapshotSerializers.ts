import { chunk, decToHex } from '@/common/utils'

const SEPARATOR = ', '

type TypeofResult =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'

// prettier-ignore
type TypeofResultToType<T extends TypeofResult> =
  T extends 'string'    ? string :
  T extends 'number'    ? number :
  T extends 'bigint'    ? bigint :
  T extends 'boolean'   ? boolean :
  T extends 'symbol'    ? symbol :
  T extends 'undefined' ? undefined :
  T extends 'object'    ? object :
  T extends 'function'  ? Function :
  never

const isArrayOf =
  <T extends TypeofResult>(...types: T[]) =>
  (value: unknown): value is Array<TypeofResultToType<T>> =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => (types as TypeofResult[]).includes(typeof item))

export const shortArraySerializer: jest.SnapshotSerializerPlugin = {
  test: (value) => isArrayOf('number', 'boolean')(value) && value.length <= 4,
  serialize: (arr: Array<number | boolean>) => `[${arr.join(SEPARATOR)},]`,
}

export const memoryDataSerializer: jest.SnapshotSerializerPlugin = {
  test: (value) => isArrayOf('number', 'string')(value) && value.length % 0x10 === 0,
  serialize: (arr: Array<number | string>, _config, indentation) => `[
${chunk(0x10, arr)
  .map(
    (row) =>
      `${indentation}${' '.repeat(2)}${row
        .map((value) => (typeof value === 'number' ? decToHex(value) : value))
        .join(SEPARATOR)}`,
  )
  .join(',\n')},
${indentation}]`,
}
