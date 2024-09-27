import type { AssemblyNode, AssemblyNodeValue } from './assemblyunit'
import * as AST from './ast'

export type WithIdentifier<Node> =
  Node extends { children: infer Values extends any[] }
    ? HasIdentifier<Values> extends true
      ? Node
      : never
    : never

type HasIdentifier<Values extends any[]> =
  Values extends [infer First, ...infer Rest]
    ? First extends AST.Identifier
      ? true
      : First extends { children: infer FirstValues extends any[] }
        ? HasIdentifier<FirstValues> extends true
          ? true
          : HasIdentifier<Rest>
        : HasIdentifier<Rest>
    : false

const some = Array.prototype.some

export function hasIdentifier<Node extends AssemblyNode>(node: Node): node is WithIdentifier<Node> {
  return some.call(node.children, aux)

  function aux(value: AssemblyNodeValue) {
    return (typeof value === 'object')
      && (
        (value.type === AST.NodeType.Identifier)
        || some.call(value.children, aux)
      )
  }
}

const reduce = Array.prototype.reduce<number>

export function getSize(node: AssemblyNode): number {
  return aux(0, node)

  function aux(acc: number, cur: AssemblyNodeValue) {
    return (typeof cur !== 'object')
      ? (acc + 1)
      : reduce.call(cur.children, aux, acc)
  }
}
