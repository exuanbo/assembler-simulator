import { describe, expect, it } from 'vitest'

import { ComposeProvider } from '@/common/utils/context'
import { examples } from '@/features/editor/examples'

import * as AST from './ast'
import { createLexer } from './lexer'
import {
  createParser,
  parseComment,
  parseDirective,
  parseInstruction,
  parseLabel,
  parseStatement,
} from './parser'
import { createParserContext, ParserContext } from './parser.context'
import type { ParserFn } from './parser.utils'
import { createTokenStream, TokenStream } from './token.stream'

function exhaust<Result>(generator: Generator<unknown, Result>): Result {
  while (true) {
    const { done, value } = generator.next()
    if (done) {
      return value
    }
  }
}

function applyParser<Node extends AST.Node>(
  input: string,
  parse: ParserFn<Node>,
  context = createParserContext(),
) {
  const lexer = createLexer(input)
  const stream = createTokenStream(lexer)
  return ComposeProvider({
    contexts: [
      ParserContext.Provider({ value: context }),
      TokenStream.Provider({ value: stream }),
    ],
    callback: parse,
  })
}

describe('Parser', () => {
  describe('examples', () => {
    examples.forEach(({ title, content }) => {
      it(`should parse example ${title}`, () => {
        const parser = createParser()
        const program = applyParser(content, () => exhaust(parser))
        expect(program).toMatchSnapshot()
      })
    })
  })

  describe('parseProgram', () => {
    it('should parse a empty program', () => {
      const input = `
      ; program
      end
      `
      const parser = createParser()
      const node = applyParser(input, () => exhaust(parser))
      expect(node).toMatchObject({
        type: AST.NodeType.Program,
        comments: [expect.any(Object)],
        statements: [expect.any(Object)],
      })
    })

    it('should throw an error when expecting token', () => {
      const input = 'inc'
      const parser = createParser()
      expect(() => applyParser(input, () => exhaust(parser))).toThrowErrorMatchingInlineSnapshot(
        `[ParserError: Unexpected end of input]`,
      )
    })

    it('should throw an error when END directive is not found', () => {
      const input = 'halt'
      const parser = createParser()
      expect(() => applyParser(input, () => exhaust(parser))).toThrowErrorMatchingInlineSnapshot(
        `[ParserError: Expected directive 'END']`,
      )
    })
  })

  describe('parseComment', () => {
    it('should parse a comment', () => {
      const input = '; This is a comment'
      const node = applyParser(input, parseComment)
      expect(node).toMatchObject({
        type: AST.NodeType.Comment,
        value: input,
      })
    })
  })

  describe('parseStatement', () => {
    it('should throw an error when the statement is not valid', () => {
      const input = 'invalid'
      expect(() => applyParser(input, parseStatement)).toThrowErrorMatchingInlineSnapshot(
        `[ParserError: Expected label, instruction, or directive]`,
      )
    })
  })

  describe('parseLabel', () => {
    it('should parse a label', () => {
      const input = 'label:'
      const node = applyParser(input, parseLabel)
      expect(node).toMatchObject({
        type: AST.NodeType.Label,
        identifier: {
          type: AST.NodeType.Identifier,
          children: ['LABEL'],
        },
      })
    })

    it('should throw an error when identifier is not valid', () => {
      const input = '0label:'
      expect(() => applyParser(input, parseLabel)).toThrowErrorMatchingInlineSnapshot(
        `[ParserError: Expected identifier]`,
      )
    })

    it('should emit an error when identifier is duplicated', () => {
      const context = createParserContext()
      const input = 'label:'
      applyParser(input, parseLabel, context)
      applyParser(input, parseLabel, context)
      const errors = context.flushErrors()
      expect(errors).toHaveLength(1)
      expect(errors[0]).toMatchInlineSnapshot(`[ParserError: Duplicate label 'LABEL']`)
    })

    it('should emit a warning when label is not referenced', () => {
      const context = createParserContext()
      const input = 'label:'
      applyParser(input, parseLabel, context)
      context.checkLabels()
      const errors = context.flushErrors()
      expect(errors).toHaveLength(1)
      expect(errors[0]).toMatchInlineSnapshot(`[ParserWarning: Unreferenced label 'LABEL']`)
    })
  })

  describe('parseInstruction', () => {
    describe('unary arithmetic instructions', () => {
      it('should parse', () => {
        ;[
          ['inc', 'al'],
          ['dec', 'bl'],
          ['not', 'cl'],
          ['rol', 'dl'],
          ['ror', 'al'],
          ['shl', 'bl'],
          ['shr', 'cl'],
        ].forEach(([instruction, destination]) => {
          const input = `${instruction} ${destination}`
          const node = applyParser(input, parseInstruction)
          const mnemonic = instruction.toUpperCase()
          expect(node).toMatchObject({
            type: AST.NodeType.Instruction,
            children: [
              mnemonic,
              {
                type: AST.NodeType.Register,
                children: [destination.toUpperCase()],
              },
            ],
            mnemonic,
          })
        })
      })

      it('should throw an error when operand is not valid', () => {
        const input = 'inc [al]'
        expect(() => applyParser(input, parseInstruction)).toThrowErrorMatchingInlineSnapshot(
          `[ParserError: Expected register]`,
        )
      })
    })

    describe('binary arithmetic instructions', () => {
      it('should parse', () => {
        ;[
          ['add', 'al', 'bl'],
          ['sub', 'bl', 'cl'],
          ['mul', 'cl', 'dl'],
          ['div', 'dl', '01'],
          ['mod', 'al', '02'],
          ['and', 'bl', '03'],
          ['or', 'cl', '04'],
          ['xor', 'dl', 'al'],
        ].forEach(([instruction, destination, source]) => {
          const input = `${instruction} ${destination}, ${source}`
          const node = applyParser(input, parseInstruction)
          const mnemonic = instruction.toUpperCase()
          expect(node).toMatchObject({
            type: AST.NodeType.Instruction,
            children: [
              mnemonic,
              {
                type: AST.NodeType.Register,
                children: [destination.toUpperCase()],
              },
              {
                type: expect.any(Number),
              },
            ],
            mnemonic,
          })
        })
      })

      it('should throw an error when comma is missing', () => {
        const input = 'add al bl'
        expect(() => applyParser(input, parseInstruction)).toThrowErrorMatchingInlineSnapshot(
          `[ParserError: Expected comma]`,
        )
      })

      it('should throw an error when operand is not valid', () => {
        const input = 'add al, [bl]'
        expect(() => applyParser(input, parseInstruction)).toThrowErrorMatchingInlineSnapshot(
          `[ParserError: Expected register or number]`,
        )
      })
    })

    describe('jump instructions', () => {
      it('should parse', () => {
        ;[
          ['jmp', 'label'],
          ['jz', 'label'],
          ['jnz', 'label'],
          ['js', 'label'],
          ['jns', 'label'],
          ['jo', 'label'],
          ['jno', 'label'],
        ].forEach(([instruction, label]) => {
          const input = `${instruction} ${label}`
          const node = applyParser(input, parseInstruction)
          const mnemonic = instruction.toUpperCase()
          expect(node).toMatchObject({
            type: AST.NodeType.Instruction,
            children: [
              mnemonic,
              {
                type: AST.NodeType.Identifier,
                children: [label.toUpperCase()],
              },
            ],
            mnemonic,
          })
        })
      })

      it('should throw an error when label is not valid', () => {
        const input = 'jmp 0label'
        expect(() => applyParser(input, parseInstruction)).toThrowErrorMatchingInlineSnapshot(
          `[ParserError: Expected identifier]`,
        )
      })

      it('should emit an error when label is not found', () => {
        const context = createParserContext()
        const input = 'jmp label'
        applyParser(input, parseInstruction, context)
        context.checkLabels()
        const errors = context.flushErrors()
        expect(errors).toHaveLength(1)
        expect(errors[0]).toMatchInlineSnapshot(`[ParserError: Undefined label 'LABEL']`)
      })
    })

    describe('move instruction', () => {
      it('should parse reg <- imm', () => {
        const input = 'mov al, 01'
        const node = applyParser(input, parseInstruction)
        expect(node).toMatchObject({
          type: AST.NodeType.Instruction,
          children: [
            AST.Mnemonic.MOV,
            {
              type: AST.NodeType.Register,
              children: [AST.RegisterName.AL],
            },
            {
              type: AST.NodeType.Immediate,
              children: [1],
            },
          ],
          mnemonic: AST.Mnemonic.MOV,
        })
      })

      it('should parse reg <- ram', () => {
        const input = 'mov bl, [02]'
        const node = applyParser(input, parseInstruction)
        expect(node).toMatchObject({
          type: AST.NodeType.Instruction,
          children: [
            AST.Mnemonic.MOV,
            {
              type: AST.NodeType.Register,
              children: [AST.RegisterName.BL],
            },
            {
              type: AST.NodeType.MemoryOperand,
              children: [
                {
                  type: AST.NodeType.Immediate,
                  children: [2],
                },
              ],
            },
          ],
          mnemonic: AST.Mnemonic.MOV,
        })
      })

      it('should parse ram <- reg', () => {
        const input = 'mov [cl], dl'
        const node = applyParser(input, parseInstruction)
        expect(node).toMatchObject({
          type: AST.NodeType.Instruction,
          children: [
            AST.Mnemonic.MOV,
            {
              type: AST.NodeType.MemoryOperand,
              children: [
                {
                  type: AST.NodeType.Register,
                  children: [AST.RegisterName.CL],
                },
              ],
            },
            {
              type: AST.NodeType.Register,
              children: [AST.RegisterName.DL],
            },
          ],
          mnemonic: AST.Mnemonic.MOV,
        })
      })

      it('should throw an error when comma is missing', () => {
        const input = 'mov al 01'
        expect(() => applyParser(input, parseInstruction)).toThrowErrorMatchingInlineSnapshot(
          `[ParserError: Expected comma]`,
        )
      })

      it('should throw an error when closing bracket is missing', () => {
        const input = 'mov [al, 01'
        expect(() => applyParser(input, parseInstruction)).toThrowErrorMatchingInlineSnapshot(
          `[ParserError: Expected closing square bracket]`,
        )
      })
    })

    describe('compare instruction', () => {
      it('should parse', () => {
        ;[
          ['al', 'bl'],
          ['bl', '01'],
          ['cl', '[02]'],
        ].forEach(([left, right]) => {
          const input = `cmp ${left}, ${right}`
          const node = applyParser(input, parseInstruction)
          expect(node).toMatchObject({
            type: AST.NodeType.Instruction,
            children: [
              AST.Mnemonic.CMP,
              {
                type: AST.NodeType.Register,
                children: [left.toUpperCase()],
              },
              {
                type: expect.any(Number),
              },
            ],
            mnemonic: AST.Mnemonic.CMP,
          })
        })
      })

      it('should emit an error when operand is register address', () => {
        const context = createParserContext()
        const input = 'cmp al, [bl]'
        applyParser(input, parseInstruction, context)
        const errors = context.flushErrors()
        expect(errors).toHaveLength(1)
        expect(errors[0]).toMatchInlineSnapshot(`[ParserError: Expected number]`)
      })

      it('should throw an error when comma is missing', () => {
        const input = 'cmp al bl'
        expect(() => applyParser(input, parseInstruction)).toThrowErrorMatchingInlineSnapshot(
          `[ParserError: Expected comma]`,
        )
      })
    })

    it('should parse register stack instructions', () => {
      ;[
        ['push', 'al'],
        ['pop', 'bl'],
      ].forEach(([instruction, register]) => {
        const input = `${instruction} ${register}`
        const node = applyParser(input, parseInstruction)
        const mnemonic = instruction.toUpperCase()
        expect(node).toMatchObject({
          type: AST.NodeType.Instruction,
          children: [
            mnemonic,
            {
              type: AST.NodeType.Register,
              children: [register.toUpperCase()],
            },
          ],
          mnemonic,
        })
      })
    })

    it('should parse flag stack instructions', () => {
      ;['pushf', 'popf'].forEach((instruction) => {
        const input = `${instruction}`
        const node = applyParser(input, parseInstruction)
        const mnemonic = instruction.toUpperCase()
        expect(node).toMatchObject({
          type: AST.NodeType.Instruction,
          children: [mnemonic],
          mnemonic,
        })
      })
    })

    it('should parse call procedure instruction', () => {
      const input = 'call 01'
      const node = applyParser(input, parseInstruction)
      expect(node).toMatchObject({
        type: AST.NodeType.Instruction,
        children: [
          AST.Mnemonic.CALL,
          {
            type: AST.NodeType.Immediate,
            children: [1],
          },
        ],
        mnemonic: AST.Mnemonic.CALL,
      })
    })

    it('should parse return procedure instruction', () => {
      const input = 'ret'
      const node = applyParser(input, parseInstruction)
      expect(node).toMatchObject({
        type: AST.NodeType.Instruction,
        children: [AST.Mnemonic.RET],
        mnemonic: AST.Mnemonic.RET,
      })
    })

    it('should parse trap interrupt instruction', () => {
      const input = 'int 01'
      const node = applyParser(input, parseInstruction)
      expect(node).toMatchObject({
        type: AST.NodeType.Instruction,
        children: [
          AST.Mnemonic.INT,
          {
            type: AST.NodeType.Immediate,
            children: [1],
          },
        ],
        mnemonic: AST.Mnemonic.INT,
      })
    })

    it('should parse return interrupt instruction', () => {
      const input = 'iret'
      const node = applyParser(input, parseInstruction)
      expect(node).toMatchObject({
        type: AST.NodeType.Instruction,
        children: [AST.Mnemonic.IRET],
        mnemonic: AST.Mnemonic.IRET,
      })
    })

    it('should parse input output instructions', () => {
      ;[
        ['in', '01'],
        ['out', '02'],
      ].forEach(([instruction, port]) => {
        const input = `${instruction} ${port}`
        const node = applyParser(input, parseInstruction)
        const mnemonic = instruction.toUpperCase()
        expect(node).toMatchObject({
          type: AST.NodeType.Instruction,
          children: [
            mnemonic,
            {
              type: AST.NodeType.Immediate,
              children: [Number(port)],
            },
          ],
          mnemonic,
        })
      })
    })

    it('should parse control instructions', () => {
      ;['halt', 'sti', 'cli', 'clo', 'nop'].forEach((instruction) => {
        const input = `${instruction}`
        const node = applyParser(input, parseInstruction)
        const mnemonic = instruction.toUpperCase()
        expect(node).toMatchObject({
          type: AST.NodeType.Instruction,
          children: [mnemonic],
          mnemonic,
        })
      })
    })
  })

  describe('parseDirective', () => {
    it('should parse end directive', () => {
      const input = 'end'
      const node = applyParser(input, parseDirective)
      expect(node).toMatchObject({
        type: AST.NodeType.Directive,
        name: AST.DirectiveName.END,
      })
    })

    it('should parse org directive', () => {
      const input = 'org 01'
      const node = applyParser(input, parseDirective)
      expect(node).toMatchObject({
        type: AST.NodeType.Directive,
        name: AST.DirectiveName.ORG,
        address: {
          type: AST.NodeType.Immediate,
          children: [1],
        },
      })
    })

    describe('db directive', () => {
      it('should parse', () => {
        const input = 'db "hello"'
        const node = applyParser(input, parseDirective)
        expect(node).toMatchObject({
          type: AST.NodeType.Directive,
          name: AST.DirectiveName.DB,
          children: [
            {
              type: AST.NodeType.StringLiteral,
              children: 'hello',
            },
          ],
        })
      })

      it('should parse escaped characters', () => {
        const input = 'db "\\0\\t\\n\\r\\"\\""'
        const node = applyParser(input, parseDirective)
        expect(node).toMatchObject({
          type: AST.NodeType.Directive,
          name: AST.DirectiveName.DB,
          children: [
            {
              type: AST.NodeType.StringLiteral,
              children: '\0\t\n\r""',
            },
          ],
        })
      })

      it('should parse invalid escape sequence', () => {
        const input = 'db "\\q"'
        const node = applyParser(input, parseDirective)
        expect(node).toMatchObject({
          type: AST.NodeType.Directive,
          name: AST.DirectiveName.DB,
          children: [
            {
              type: AST.NodeType.StringLiteral,
              children: 'q',
            },
          ],
        })
      })
    })
  })
})
