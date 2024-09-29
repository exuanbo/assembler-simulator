import { invariant } from '@/common/utils/invariant'

import * as AST from './ast'
import { ErrorCode, ParserError } from './errors'
import { useTokenStream } from './token.stream'

export type ParserFn<Node extends AST.Node> = (() => Node)

const typeRegistry = new Map<ParserFn<any>, AST.NodeType>()

function getType<Node extends AST.Node>(fn: ParserFn<Node>): Node['type'] {
  const type = typeRegistry.get(fn)
  invariant(type, `Parser function '${fn.name}' is not registered`)
  return type
}
export function registerType<Node extends AST.Node>(fn: ParserFn<Node>, type: Node['type']) {
  typeRegistry.set(fn, type)
  return fn
}

const GUARD_FAILED: unknown = Symbol('GUARD_FAILED')

export function guard(condition: unknown): asserts condition {
  if (!condition) {
    throw GUARD_FAILED
  }
}

export function tryParsers<Fn extends ParserFn<any>>(fns: Fn[]): ReturnType<Fn> {
  const stream = useTokenStream()
  for (const fn of fns) {
    const restore = stream.snapshot()
    try {
      return fn()
    }
    catch (error) {
      if (error === GUARD_FAILED) {
        restore()
      }
      else throw error
    }
  }
  const token = stream.peek()
  const expected = joinNames(fns.map(getType))
  throw new ParserError(ErrorCode.UnexpectedToken, token.loc, { expected })
}

function joinNames(types: AST.NodeType[]): string {
  invariant(types.length)
  const names = types.map(AST.getNodeName)
  const formatter = new Intl.ListFormat('en', { type: 'disjunction' })
  return formatter.format(names)
}

export function expectType(node: AST.Node, type: AST.NodeType): void {
  if (node.type !== type) {
    const expected = AST.getNodeName(type)
    throw new ParserError(ErrorCode.UnexpectedToken, node.loc, { expected })
  }
}
