import type { A, Test } from 'ts-toolbelt'

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
  arg: infer ArgAsLastUnionMember,
) => void
  ? [...UnionToTuple<Exclude<Union, ArgAsLastUnionMember>>, ArgAsLastUnionMember]
  : []

export declare function checkType<Type, Expect, Outcome extends Test.Pass | Test.Fail>(): A.Equals<
  A.Equals<Type, Expect>,
  Outcome
>

export declare function checkTypes(outcomes: Test.Pass[]): void
