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

export function hasIdentifier<Node extends AssemblyNode>(node: Node): node is WithIdentifier<Node> {
  return Array.from(node.children).some(aux)

  function aux(value: AssemblyNodeValue) {
    return (typeof value === 'object')
      && ((value.type === AST.NodeType.Identifier)
        || Array.from(value.children).some(aux))
  }
}

export function getSize(node: AssemblyNode) {
  return aux(0, node)

  function aux(acc: number, cur: AssemblyNodeValue): number {
    return (typeof cur !== 'object')
      ? (acc + 1)
      : Array.from(cur.children).reduce(aux, acc)
  }
}
