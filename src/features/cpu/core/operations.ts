import { DivideByZeroError } from '../../../common/exceptions'

export const add = (addend: number, augend: number): number => augend + addend

export const substract = (subtrahend: number, minuend: number): number => minuend - subtrahend

export const multiply = (multiplier: number, multiplicand: number): number =>
  multiplicand * multiplier

const checkDivisor = (value: number): number => {
  if (value === 0) {
    throw new DivideByZeroError()
  }
  return value
}

export const divide = (divisor: number, dividend: number): number =>
  Math.floor(dividend / checkDivisor(divisor))

export const increase = (n: number): number => add(1, n)

export const decrease = (n: number): number => substract(1, n)

export const modulo = (divisor: number, dividend: number): number =>
  dividend % checkDivisor(divisor)

/**
 * @returns {number} b & a
 */
export const and = (a: number, b: number): number => b & a

/**
 * @returns {number} b | a
 */
export const or = (a: number, b: number): number => b | a

/**
 * @returns {number} b ^ a
 */
export const xor = (a: number, b: number): number => b ^ a

export const not = (n: number): number => ~n

export const rol = (n: number): number => {
  const MSB = divide(0x80, n)
  return (n << 1) + MSB
}

export const ror = (n: number): number => {
  const LSB = modulo(2, n)
  return LSB * 0x80 + (n >> 1)
}

export const shl = (n: number): number => n << 1

export const shr = (n: number): number => n >> 1
