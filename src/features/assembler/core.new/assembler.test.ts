import { describe, expect, it } from 'vitest'

import { examples } from '@/features/editor/examples'

import { createAssembler } from './assembler'

describe('Assembler', () => {
  examples.forEach(({ title, content }) => {
    it(`should assemble example ${title}`, () => {
      const assembler = createAssembler()
      const unit = assembler.run(content)
      expect(unit.ast).not.toBeNull()
      expect(unit.chunks.length).toBeGreaterThan(0)
      expect(unit.warnings).toHaveLength(0)
      expect(unit.errors).toHaveLength(0)
    })
  })

  it('should collect parser errors', () => {
    const assembler = createAssembler()
    const unit = assembler.run('inc al')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[ParserError: Expected directive 'END']`,
    )
  })

  it('should collect parser warnings', () => {
    const assembler = createAssembler()
    const unit = assembler.run('label: end')
    expect(unit.warnings).toHaveLength(1)
    expect(unit.warnings[0]).toMatchInlineSnapshot(
      `[ParserWarning: Unreferenced label 'LABEL']`,
    )
  })

  it('should validate jump distances', () => {
    const assembler = createAssembler()
    const unit = assembler.run('jmp label org 81 label: end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Jump distance 129 out of range (0 to 127 forward, 128 to 255 backward)]`,
    )
  })

  it('should validate immediate values', () => {
    const assembler = createAssembler()
    const unit = assembler.run('add al, 100 end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Immediate value 256 exceeds maximum of 255]`,
    )
  })

  it('should validate string literals', () => {
    const assembler = createAssembler()
    const unit = assembler.run('db "你好世界" end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Character '你' has UTF-16 code 20320 exceeds maximum of 255]`,
    )
  })

  it('should validate org address', () => {
    const assembler = createAssembler()
    const unit = assembler.run('org 100 end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Memory address exceeds maximum of 255]`,
    )
  })

  it('should throw an error when memory overflows', () => {
    const assembler = createAssembler()
    const unit = assembler.run('org ff inc al end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Memory address exceeds maximum of 255]`,
    )
  })

  it('should merge errors', () => {
    const assembler = createAssembler()
    const unit = assembler.run('org ff inc al inc bl inc cl end')
    expect(unit.errors).toHaveLength(1)
    expect(unit.errors[0]).toMatchInlineSnapshot(
      `[AssemblerError: Memory address exceeds maximum of 255]`,
    )
    expect(unit.errors[0].loc).toHaveLength(3)
  })
})
