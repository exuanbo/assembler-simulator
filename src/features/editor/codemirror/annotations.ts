import { Annotation, type Transaction, type TransactionSpec } from '@codemirror/state'

const StringAnnotation = Annotation.define<string>()

export const withStringAnnotation =
  (value: string) =>
  (spec: TransactionSpec): TransactionSpec => {
    const annotations = [spec.annotations ?? []].flat()
    return {
      ...spec,
      annotations: [...annotations, StringAnnotation.of(value)],
    }
  }

export const hasStringAnnotation =
  (value: string) =>
  (transaction: Transaction): boolean =>
    transaction.annotation(StringAnnotation) === value
