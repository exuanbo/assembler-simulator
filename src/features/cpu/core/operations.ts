import { DivideByZeroError } from './exceptions'

export const add = (addend: number, augend: number): number => augend + addend

export const subtract = (subtrahend: number, minuend: number): number => minuend - subtrahend

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

export const decrease = (n: number): number => subtract(1, n)

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

export const rol = (n: number): number => (n << 1) | (n >> 7)

export const ror = (n: number): number => (n >> 1) | (n << 7)

export const shl = (n: number): number => n << 1

export const shr = (n: number): number => n >> 1
