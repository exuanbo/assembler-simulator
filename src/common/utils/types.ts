// Modified from an answer to the question
// "How can I see the full expanded contract of a Typescript type?"
// https://stackoverflow.com/a/57683652/13346012
export type ExpandDeep<T> = T extends Record<string | number | symbol, unknown>
  ? { [K in keyof T]: ExpandDeep<T[K]> }
  : T extends Array<infer E>
  ? Array<ExpandDeep<E>>
  : T

export type ExcludeTail<T extends unknown[]> = T extends [...infer Excluded, unknown]
  ? Excluded
  : []

type UnionToFunctionWithUnionAsArg<Union> = (arg: Union) => void

type UnionToFunctionIntersectionWithUnionMemberAsArg<Union> = (
  Union extends never ? never : (arg: UnionToFunctionWithUnionAsArg<Union>) => void
) extends (arg: infer ArgAsFunctionIntersection) => void
  ? ArgAsFunctionIntersection
  : never

// Modified from a comment in the issue
// "Type manipulations: union to tuple #13298"
// https://github.com/microsoft/TypeScript/issues/13298#issuecomment-885980381
export type UnionToTuple<Union> = UnionToFunctionIntersectionWithUnionMemberAsArg<Union> extends (
  arg: infer ArgAsLastUnionMember
) => void
  ? [...UnionToTuple<Exclude<Union, ArgAsLastUnionMember>>, ArgAsLastUnionMember]
  : []
