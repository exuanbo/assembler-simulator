import { Annotation, type Transaction, type TransactionSpec } from '@codemirror/state'

const StringAnnotation = Annotation.define<string>()

export const withStringAnnotation =
  (value: string) =>
  (spec: TransactionSpec): TransactionSpec => ({
    ...spec,
    annotations: [StringAnnotation.of(value)].concat(spec.annotations ?? []),
  })

export const hasStringAnnotation =
  (value: string) =>
  (transaction: Transaction): boolean =>
    transaction.annotation(StringAnnotation) === value
