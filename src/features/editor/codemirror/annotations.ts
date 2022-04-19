import { Annotation, Transaction } from '@codemirror/state'

export const StringAnnotation = Annotation.define<string>()

export const hasStringAnnotation =
  (value: string) =>
  (transaction: Transaction): boolean =>
    transaction.annotation(StringAnnotation) === value
