import type { AssemblyNode, AssemblyNodeValue } from './assemblyunit'
import * as AST from './ast'

export type WithIdentifier<Node> =
  Node extends { children: infer Values extends unknown[] }
    ? HasIdentifier<Values> extends true
      ? Node
      : never
    : never

type HasIdentifier<Values extends unknown[]> =
  Values extends [infer First, ...infer Rest]
    ? First extends AST.Identifier
      ? true
      : First extends { children: infer FirstValues extends unknown[] }
        ? HasIdentifier<FirstValues> extends true
          ? true
          : HasIdentifier<Rest>
        : HasIdentifier<Rest>
    : false

const some = Array.prototype.some

export function hasIdentifier<Node extends AssemblyNode>(node: Node): node is WithIdentifier<Node> {
  return some.call(node.children, aux)

  function aux(value: AssemblyNodeValue) {
    return Object.hasOwn(value, 'type')
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
    return !Object.hasOwn(cur, 'children')
      ? (acc + 1)
      : reduce.call(cur.children, aux, acc)
  }
}
