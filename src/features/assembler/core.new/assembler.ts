import { ComposeProvider } from '@/common/utils/context'
import { invariant } from '@/common/utils/invariant'

import { AssemblerState, createAssemblerState, useAssemblerState } from './assembler.state'
import { hasIdentifier, type WithIdentifier } from './assembler.utils'
import {
  type AssemblyNode,
  type AssemblyUnit,
  type CodeChunk,
  finish,
  initUnit,
} from './assemblyunit'
import * as AST from './ast'
import { AssemblerError, type AssemblyError, ErrorCode, ParserError, Severity } from './errors'
import * as InstrSet from './instrset'
import { resolveOpcode } from './instrset.utils'
import { createLexer } from './lexer'
import { createParser } from './parser'
import { createParserContext, ParserContext, useParserContext } from './parser.context'
import { createTokenStream, TokenStream } from './token.stream'

// TODO: move to somewhere
const MAX_NUMBER = 0xff

export interface Assembler {
  run(input: string): AssemblyUnit
}

export function createAssembler(): Assembler {
  return new AssemblerImpl()
}

interface PendingChunk extends CodeChunk {
  node: WithIdentifier<ProcessableNode>
}

type ProcessableNode = Extract<AST.Statement, AssemblyNode>

type ResolvableNode =
  ProcessableNode extends { children: (infer Values)[] }
    ? Exclude<Values, AST.Mnemonic>
    : never

class AssemblerImpl implements Assembler {
  private pending!: PendingChunk[]
  private unit!: AssemblyUnit

  private setup(): AssemblyUnit {
    this.pending = []
    return (this.unit = initUnit())
  }

  run(input: string): AssemblyUnit {
    const lexer = createLexer(input)
    const stream = createTokenStream(lexer)
    const context = createParserContext()
    const initialState = createAssemblerState()
    return ComposeProvider({
      contexts: [
        AssemblerState.Provider({ value: initialState }),
        ParserContext.Provider({ value: context }),
        TokenStream.Provider({ value: stream }),
      ],
      callback: () => {
        const unit = this.setup()
        const ast = this.parse()
        return this.hasError()
          ? finish(unit, { chunks: [] })
          : finish(unit, { ast, labels: context.labels })
      },
    })
  }

  private parse(): AST.Program | null {
    const context = useParserContext()
    const parser = createParser()
    try {
      while (true) {
        const { done, value: node } = parser.next()
        if (done) {
          return node
        }
        this.collectErrors(context)
        this.processStatement(node)
      }
    }
    catch (error) {
      if (error instanceof ParserError) {
        this.addError(error)
      }
      else throw error
    }
    finally {
      context.checkLabels()
      this.collectErrors(context)
      this.processPendings()
    }
    return null
  }

  private hasError(): boolean {
    return !!this.unit.errors.length
  }

  private collectErrors(context: ParserContext): void {
    const errors = context.flushErrors()
    this.addError(...errors)
  }

  private catchError<Result>(callback: (() => Result)): Result | undefined
  private catchError<Result, Fallback>(callback: (() => Result), fallback: Fallback): Result | Fallback
  private catchError<Result, Fallback>(callback: (() => Result), fallback?: Fallback) {
    try {
      return callback()
    }
    catch (error) {
      if (error instanceof AssemblerError) {
        this.addError(error)
      }
      else throw error
    }
    return fallback
  }

  private addError(...errors: AssemblyError[]): void {
    errors.forEach((error) => {
      if (error.severity === Severity.Error) {
        this.unit.errors.push(error)
      }
      else {
        this.unit.warnings.push(error)
      }
    })
  }

  private updateAddress(node: AST.Immediate | ProcessableNode): void {
    const state = useAssemblerState()
    if (node.type === AST.NodeType.Immediate) {
      this.catchError(() => state.setAddress(node))
    }
    else {
      this.catchError(() => state.advanceAddress(node))
    }
  }

  private processStatement(node: AST.Statement): void {
    switch (node.type) {
    case AST.NodeType.Label:
      this.processLabel(node.identifier)
      break
    case AST.NodeType.Instruction:
      this.processInstruction(node)
      this.updateAddress(node)
      break
    case AST.NodeType.Directive:
      switch (node.name) {
      case AST.DirectiveName.DB:
        this.processDataByte(node)
        this.updateAddress(node)
        break
      case AST.DirectiveName.ORG:
        this.updateAddress(node.address)
        break
      }
      break
    }
  }

  private processLabel({ children: [id] }: AST.Identifier): void {
    const state = useAssemblerState()
    const context = useParserContext()
    const label = context.labels.get(id)
    invariant(label?.loc, `Label '${id}' is undefined`)
    label.address = state.address
  }

  private processInstruction(node: AST.Instruction): void {
    const state = useAssemblerState()
    const chunk = {
      address: state.address,
      codes: [],
    }
    if (hasIdentifier(node)) {
      this.pending.push({ ...chunk, node })
    }
    else {
      this.encodeInstruction(node, chunk.codes)
      this.unit.chunks.push({ ...chunk, node })
    }
  }

  private processDataByte(node: AST.Db): void {
    const state = useAssemblerState()
    const codes = this.resolve(node.children)
    this.unit.chunks.push({
      address: state.address,
      codes,
      node,
    })
  }

  private processPendings(): void {
    this.pending.forEach((chunk) => {
      AssemblerState.Provider({
        value: createAssemblerState(chunk.address),
        callback: () => this.encodePending(chunk),
      })
      this.unit.chunks.push(chunk)
    })
  }

  private encodePending({ codes, node }: PendingChunk): void {
    switch (node.type) {
    case AST.NodeType.Instruction:
      this.encodeInstruction(node, codes)
      break
    default:
      // @ts-expect-error: never
      throw new Error(`Node '${node.type.toString()}' is not processed`)
    }
  }

  private encodeInstruction(node: AST.Instruction, codes: number[]): void {
    const [mnemonic, ...operands] = node.children
    const opcode = resolveOpcode(mnemonic, operands)
    codes.push(opcode, ...this.resolve(operands))
  }

  private resolve(nodes: ResolvableNode[]): number[] {
    return this.catchError(() => unsafe_resolve(nodes), [])
  }
}

function unsafe_resolve(nodes: ResolvableNode[]): number[] {
  return nodes.flatMap((node) => {
    switch (node.type) {
    case AST.NodeType.MemoryOperand:
      return unsafe_resolve(node.children)
    case AST.NodeType.Identifier:
      return resolveIdentifier(node)
    case AST.NodeType.Register:
      return resolveRegister(node)
    case AST.NodeType.Immediate:
      return resolveImmediate(node)
    case AST.NodeType.StringLiteral:
      return resolveStringLiteral(node)
    }
  })
}

function resolveIdentifier({ children: [id], loc }: AST.Identifier): number {
  const state = useAssemblerState()
  const context = useParserContext()
  const label = context.labels.get(id)
  invariant(label, `Label '${id}' is not added`)
  invariant(!Number.isNaN(label.address), `Label '${id}' is not processed`)
  const distance = label.address - state.address
  if ((distance < -0x80) || (distance > 0x7f)) {
    throw new AssemblerError(ErrorCode.JumpOutOfRange, loc, { distance })
  }
  return unsign8(distance)
}

// TODO: move to utils
function unsign8(value: number): number {
  return (value < 0) ? (value + MAX_NUMBER + 1) : value
}

function resolveRegister({ children: [name] }: AST.Register): number {
  return InstrSet.Register[name]
}

function resolveImmediate({ children: [value], loc }: AST.Immediate): number {
  if (value > MAX_NUMBER) {
    throw new AssemblerError(ErrorCode.ImmediateOutOfRange, loc, { value })
  }
  return value
}

function resolveStringLiteral({ children: chars, loc }: AST.StringLiteral): number[] {
  return Array.from(chars, (char, i) => {
    const value = chars.charCodeAt(i)
    if (value > MAX_NUMBER) {
      throw new AssemblerError(ErrorCode.CharacterOutOfRange, loc, { char, value })
    }
    return value
  })
}
