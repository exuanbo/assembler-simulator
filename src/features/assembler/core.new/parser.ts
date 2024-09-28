import * as _ from 'ts-enum-utilx'

import { invariant } from '@/common/utils/invariant'

import * as AST from './ast'
import { ErrorCode, ParserError } from './errors'
import { useParserContext } from './parser.context'
import { expectType, guard, registerType, tryParsers } from './parser.utils'
import { TokenType } from './token'
import { useTokenStream } from './token.stream'
import { parseString } from './utils'

export type Parser = Generator<AST.Statement, AST.Program>

export function *createParser(): Parser {
  const stream = useTokenStream()

  const statements: AST.Statement[] = []
  const comments: AST.Comment[] = []

  const startToken = stream.peek()

  while (stream.hasMore()) {
    const node = tryParsers([parseComment, parseStatement])
    if (node.type === AST.NodeType.Comment) {
      comments.push(node)
    }
    else {
      statements.push(node)
      if ((node.type === AST.NodeType.Directive)
        && (node.name === AST.DirectiveName.END)) {
        return {
          type: AST.NodeType.Program,
          comments,
          statements,
          loc: {
            start: startToken.loc.start,
            end: node.loc.end,
          },
        }
      }
      yield node
    }
  }

  const endToken = stream.peek()
  const expected = `directive '${AST.DirectiveName.END}'`
  throw new ParserError(ErrorCode.UnexpectedToken, endToken.loc, { expected })
}

export function parseComment(): AST.Comment {
  const stream = useTokenStream()
  const token = stream.next((token) =>
    guard(token.type === TokenType.Comment))
  return {
    type: AST.NodeType.Comment,
    value: token.value,
    loc: token.loc,
  }
}

export function parseStatement(): AST.Statement {
  return tryParsers([parseLabel, parseInstruction, parseDirective])
}

export const parseLabel = registerType((): AST.Label => {
  const context = useParserContext()
  const stream = useTokenStream()
  stream.peek((token) =>
    guard(token.type === TokenType.LabelIdentifier))
  const identifier = tryParsers([parseIdentifier])
  const colon = stream.next()
  invariant(colon.type === TokenType.Colon)
  context.addLabel(identifier)
  return {
    type: AST.NodeType.Label,
    identifier,
    loc: {
      start: identifier.loc.start,
      end: colon.loc.end,
    },
  }
}, AST.NodeType.Label)

export const parseInstruction = registerType((): AST.Instruction => {
  const stream = useTokenStream()
  const token = stream.peek((token) =>
    guard(token.type === TokenType.Identifier))
  const mnemonic = token.value.toUpperCase()
  guard(_.isValue(AST.Mnemonic, mnemonic))
  switch (mnemonic) {
  case AST.Mnemonic.INC:
  case AST.Mnemonic.DEC:
  case AST.Mnemonic.NOT:
  case AST.Mnemonic.ROL:
  case AST.Mnemonic.ROR:
  case AST.Mnemonic.SHL:
  case AST.Mnemonic.SHR:
    return parseUnaryArithmetic(mnemonic)

  case AST.Mnemonic.ADD:
  case AST.Mnemonic.SUB:
  case AST.Mnemonic.MUL:
  case AST.Mnemonic.DIV:
  case AST.Mnemonic.MOD:
  case AST.Mnemonic.AND:
  case AST.Mnemonic.OR:
  case AST.Mnemonic.XOR:
    return parseBinaryArithmetic(mnemonic)

  case AST.Mnemonic.JMP:
  case AST.Mnemonic.JZ:
  case AST.Mnemonic.JNZ:
  case AST.Mnemonic.JS:
  case AST.Mnemonic.JNS:
  case AST.Mnemonic.JO:
  case AST.Mnemonic.JNO:
    return parseJump(mnemonic)

  case AST.Mnemonic.MOV:
    return parseMove()

  case AST.Mnemonic.CMP:
    return parseCompare()

  case AST.Mnemonic.PUSH:
  case AST.Mnemonic.POP:
    return parseGeneralStack(mnemonic)

  case AST.Mnemonic.PUSHF:
  case AST.Mnemonic.POPF:
    return parseFlagStack(mnemonic)

  case AST.Mnemonic.CALL:
    return parseCallProcedure()

  case AST.Mnemonic.RET:
    return parseReturnProcedure()

  case AST.Mnemonic.INT:
    return parseTrapInterrupt()

  case AST.Mnemonic.IRET:
    return parseReturnInterrupt()

  case AST.Mnemonic.IN:
  case AST.Mnemonic.OUT:
    return parseInputOutput(mnemonic)

  case AST.Mnemonic.HALT:
  case AST.Mnemonic.STI:
  case AST.Mnemonic.CLI:
  case AST.Mnemonic.CLO:
  case AST.Mnemonic.NOP:
    return parseControl(mnemonic)
  }
}, AST.NodeType.Instruction)

function parseUnaryArithmetic(mnemonic: AST.UnaryArithmetic['mnemonic']): AST.UnaryArithmetic {
  const stream = useTokenStream()
  const token = stream.next()
  const destination = tryParsers([parseRegister])
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      destination,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: destination.loc.end,
    },
  }
}

function parseBinaryArithmetic(mnemonic: AST.BinaryArithmetic['mnemonic']): AST.BinaryArithmetic {
  const stream = useTokenStream()
  const token = stream.next()
  const destination = tryParsers([parseRegister])
  stream.expect(TokenType.Comma)
  const source = tryParsers([parseRegister, parseImmediate])
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      destination,
      source,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: source.loc.end,
    },
  }
}

function parseJump(mnemonic: AST.Jump['mnemonic']): AST.Jump {
  const context = useParserContext()
  const stream = useTokenStream()
  const token = stream.next()
  const label = tryParsers([parseIdentifier])
  context.refLabel(label)
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      label,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: label.loc.end,
    },
  }
}

function parseMove(): AST.Move {
  const mnemonic = AST.Mnemonic.MOV
  const stream = useTokenStream()
  const token = stream.next()
  const destination = tryParsers([parseRegister, parseMemoryOperand])
  stream.expect(TokenType.Comma)
  let source: AST.Immediate | AST.MemoryOperand | AST.Register
  if (destination.type === AST.NodeType.Register) {
    source = tryParsers([parseImmediate, parseMemoryOperand])
  }
  else {
    source = tryParsers([parseRegister])
  }
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      destination,
      source,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: source.loc.end,
    },
  }
}

function parseCompare(): AST.Compare {
  const mnemonic = AST.Mnemonic.CMP
  const context = useParserContext()
  const stream = useTokenStream()
  const token = stream.next()
  const left = tryParsers([parseRegister])
  stream.expect(TokenType.Comma)
  const right = tryParsers([parseRegister, parseImmediate, parseMemoryOperand])
  if (right.type === AST.NodeType.MemoryOperand) {
    const [value] = right.children
    context.catchError(() =>
      expectType(value, AST.NodeType.Immediate))
  }
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      left,
      right,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: right.loc.end,
    },
  }
}

function parseGeneralStack(mnemonic: AST.GeneralStack['mnemonic']): AST.GeneralStack {
  const stream = useTokenStream()
  const token = stream.next()
  const register = tryParsers([parseRegister])
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      register,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: register.loc.end,
    },
  }
}

function parseFlagStack(mnemonic: AST.FlagStack['mnemonic']): AST.FlagStack {
  const stream = useTokenStream()
  const token = stream.next()
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
    ],
    mnemonic,
    loc: token.loc,
  }
}

function parseCallProcedure(): AST.CallProcedure {
  const mnemonic = AST.Mnemonic.CALL
  const stream = useTokenStream()
  const token = stream.next()
  const address = tryParsers([parseImmediate])
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      address,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: address.loc.end,
    },
  }
}

function parseReturnProcedure(): AST.ReturnProcedure {
  const mnemonic = AST.Mnemonic.RET
  const stream = useTokenStream()
  const token = stream.next()
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
    ],
    mnemonic,
    loc: token.loc,
  }
}

function parseTrapInterrupt(): AST.TrapInterrupt {
  const mnemonic = AST.Mnemonic.INT
  const stream = useTokenStream()
  const token = stream.next()
  const vector = tryParsers([parseImmediate])
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      vector,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: vector.loc.end,
    },
  }
}

function parseReturnInterrupt(): AST.ReturnInterrupt {
  const mnemonic = AST.Mnemonic.IRET
  const stream = useTokenStream()
  const token = stream.next()
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
    ],
    mnemonic,
    loc: token.loc,
  }
}

function parseInputOutput(mnemonic: AST.InputOutput['mnemonic']): AST.InputOutput {
  const stream = useTokenStream()
  const token = stream.next()
  const port = tryParsers([parseImmediate])
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
      port,
    ],
    mnemonic,
    loc: {
      start: token.loc.start,
      end: port.loc.end,
    },
  }
}

function parseControl(mnemonic: AST.Control['mnemonic']): AST.Control {
  const stream = useTokenStream()
  const token = stream.next()
  return {
    type: AST.NodeType.Instruction,
    children: [
      mnemonic,
    ],
    mnemonic,
    loc: token.loc,
  }
}

export const parseDirective = registerType((): AST.Directive => {
  const stream = useTokenStream()
  const token = stream.peek((token) =>
    guard(token.type === TokenType.Identifier))
  const name = token.value.toUpperCase()
  guard(_.isValue(AST.DirectiveName, name))
  switch (name) {
  case AST.DirectiveName.END:
    return parseEnd()
  case AST.DirectiveName.ORG:
    return parseOrg()
  case AST.DirectiveName.DB:
    return parseDb()
  }
}, AST.NodeType.Directive)

function parseEnd(): AST.End {
  const stream = useTokenStream()
  const token = stream.next()
  return {
    type: AST.NodeType.Directive,
    name: AST.DirectiveName.END,
    loc: token.loc,
  }
}

function parseOrg(): AST.Org {
  const stream = useTokenStream()
  const token = stream.next()
  const address = tryParsers([parseImmediate])
  return {
    type: AST.NodeType.Directive,
    name: AST.DirectiveName.ORG,
    address,
    loc: {
      start: token.loc.start,
      end: address.loc.end,
    },
  }
}

function parseDb(): AST.Db {
  const stream = useTokenStream()
  const token = stream.next()
  const value = tryParsers([parseStringLiteral, parseImmediate])
  return {
    type: AST.NodeType.Directive,
    children: [
      value,
    ],
    name: AST.DirectiveName.DB,
    loc: {
      start: token.loc.start,
      end: value.loc.end,
    },
  }
}

// ---

const parseMemoryOperand = registerType((): AST.MemoryOperand => {
  const stream = useTokenStream()
  const left = stream.next((token) =>
    guard(token.type === TokenType.LeftSquare))
  const value = tryParsers([parseRegister, parseImmediate])
  const right = stream.expect(TokenType.RightSquare)
  return {
    type: AST.NodeType.MemoryOperand,
    children: [value],
    loc: {
      start: left.loc.start,
      end: right.loc.end,
    },
  }
}, AST.NodeType.MemoryOperand)

const parseRegister = registerType((): AST.Register => {
  const stream = useTokenStream()
  const token = stream.next((token) =>
    guard(token.type === TokenType.Identifier))
  const name = token.value.toUpperCase()
  guard(_.isValue(AST.RegisterName, name))
  return {
    type: AST.NodeType.Register,
    children: [name],
    loc: token.loc,
  }
}, AST.NodeType.Register)

const parseIdentifier = registerType((): AST.Identifier => {
  const stream = useTokenStream()
  const token = stream.next((token) =>
    guard((token.type === TokenType.Identifier)
      || (token.type === TokenType.LabelIdentifier)))
  const name = token.value.toUpperCase()
  guard(Number.isNaN(parseInt(name)))
  return {
    type: AST.NodeType.Identifier,
    children: [AST.IdentifierName(name)],
    loc: token.loc,
  }
}, AST.NodeType.Identifier)

const parseImmediate = registerType((): AST.Immediate => {
  const stream = useTokenStream()
  const token = stream.next((token) =>
    guard((token.type === TokenType.Number)
      || (token.type === TokenType.Identifier)))
  const value = Number('0x' + token.value)
  guard(!Number.isNaN(value))
  return {
    type: AST.NodeType.Immediate,
    children: [AST.ImmediateValue(value)],
    loc: token.loc,
  }
}, AST.NodeType.Immediate)

const parseStringLiteral = registerType((): AST.StringLiteral => {
  const stream = useTokenStream()
  const token = stream.next((token) =>
    guard(token.type === TokenType.String))
  const chars = parseString(token.value)
  return {
    type: AST.NodeType.StringLiteral,
    children: chars,
    loc: token.loc,
  }
}, AST.NodeType.StringLiteral)
