import { describe, expect, it } from 'vitest'

import { examples } from '@/features/editor/examples'

import { Assembler } from './assembler'

describe('Assembler', () => {
  examples.forEach(({ title, content }) => {
    it(`should assemble example ${title}`, () => {
      const assembler = new Assembler()
      const unit = assembler.assemble(content)
      expect(unit.ast).not.toBeNull()
      expect(unit.chunks.length).toBeGreaterThan(0)
      expect(unit.warnings).toHaveLength(0)
      expect(unit.errors).toHaveLength(0)
    })
  })

  it('should collect parser errors', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('inc al')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[ParserError: Expected directive 'END']`,
    )
  })

  it('should collect parser warnings', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('label: end')
    expect(unit.warnings).toHaveLength(1)
    expect(unit.warnings[0]).toMatchInlineSnapshot(
      `[ParserWarning: Unreferenced label 'LABEL']`,
    )
  })

  it('should validate jump distances', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('jmp label org 81 label: end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Jump offset 129 out of range (-128 to -1 backward, 0 to 127 forward)]`,
    )
  })

  it('should validate immediate values', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('add al, 100 end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Immediate value 256 exceeds maximum of 255]`,
    )
  })

  it('should validate string literals', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('db "你好世界" end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Character '你' has UTF-16 code 20320 exceeds maximum of 255]`,
    )
  })

  it('should validate org address', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('org 100 end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Memory address exceeds maximum of 255]`,
    )
  })

  it('should throw an error when memory overflows', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('org ff inc al end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Memory address exceeds maximum of 255]`,
    )
  })

  it('should merge errors', () => {
    const assembler = new Assembler()
    const unit = assembler.assemble('org ff inc al inc bl inc cl end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Memory address exceeds maximum of 255]`,
    )
    expect(unit.errors[0].loc).toHaveLength(3)
  })
})
