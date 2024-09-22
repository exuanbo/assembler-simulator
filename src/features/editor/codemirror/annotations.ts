import { Annotation, type Transaction, type TransactionSpec } from '@codemirror/state'

const StringAnnotation = Annotation.define<string>()

export const withStringAnnotation = (value: string) =>
  (transaction: TransactionSpec): TransactionSpec => {
    const { annotations = [] } = transaction
    return {
      ...transaction,
      annotations: [...[annotations].flat(), StringAnnotation.of(value)],
    }
  }

export const hasStringAnnotation = (value: string) =>
  (transaction: Transaction): boolean =>
    transaction.annotation(StringAnnotation) === value
