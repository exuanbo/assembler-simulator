// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/consistent-type-definitions
export type NonNullishValue = {}

export type Nullable<T> = T | null | undefined

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
