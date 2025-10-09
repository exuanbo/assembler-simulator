import type * as AST from './ast'

export const enum ErrorCode {
  UnexpectedCharacter,
  UnterminatedString,
  UnexpectedEndOfInput,
  UnexpectedToken,
  DuplicateLabel,
  UnreferencedLabel,
  UndefinedLabel,
  MemoryOverflow,
  JumpOutOfRange,
  ImmediateOutOfRange,
  CharacterOutOfRange,
}

export type ParserErrorCode
  = | ErrorCode.UnexpectedCharacter
    | ErrorCode.UnterminatedString
    | ErrorCode.UnexpectedEndOfInput
    | ErrorCode.UnexpectedToken
    | ErrorCode.DuplicateLabel
    | ErrorCode.UnreferencedLabel
    | ErrorCode.UndefinedLabel

export type AssemblerErrorCode
  = | ErrorCode.MemoryOverflow
    | ErrorCode.JumpOutOfRange
    | ErrorCode.ImmediateOutOfRange
    | ErrorCode.CharacterOutOfRange

// use to check exhaustiveness
type AssemblyErrorCode = ParserErrorCode | AssemblerErrorCode

const errormessages: Record<AssemblyErrorCode, string> = {
  [ErrorCode.UnexpectedCharacter]:  'Unexpected character',
  [ErrorCode.UnterminatedString]:   'Unterminated string',
  [ErrorCode.UnexpectedEndOfInput]: 'Unexpected end of input',
  [ErrorCode.UnexpectedToken]:      'Expected {expected}',
  [ErrorCode.DuplicateLabel]:       "Duplicate label '{name}'",
  [ErrorCode.UnreferencedLabel]:    "Unreferenced label '{name}'",
  [ErrorCode.UndefinedLabel]:       "Undefined label '{name}'",
  [ErrorCode.MemoryOverflow]:       'Memory address exceeds maximum of 255',
  [ErrorCode.JumpOutOfRange]:       'Jump offset {offset} out of range (-128 to -1 backward, 0 to 127 forward)',
  [ErrorCode.ImmediateOutOfRange]:  'Immediate value {value} exceeds maximum of 255',
  [ErrorCode.CharacterOutOfRange]:  "Character '{char}' has UTF-16 code {value} exceeds maximum of 255",
}

export const enum Severity {
  Error,
  Warning,
}

export type Location = AST.SourceLocation | AST.SourceLocation[]

export abstract class AssemblyError<T extends ErrorCode = ErrorCode> extends Error {
  abstract override name: string
  abstract severity: Severity

  constructor(
    public code: T,
    public loc: Location,
    replacements: Record<string, unknown> = {},
  ) {
    super(
      Object.entries(replacements).reduce(
        (message, [key, value]) => message.replace(`{${key}}`, String(value)),
        errormessages[code],
      ),
    )
  }
}

export class ParserError extends AssemblyError<ParserErrorCode> {
  override name = 'ParserError'
  override severity = Severity.Error
}

export class ParserWarning extends AssemblyError<ParserErrorCode> {
  override name = 'ParserWarning'
  override severity = Severity.Warning
}

export type ParserDiagnostic = ParserError | ParserWarning

export class AssemblerError extends AssemblyError<AssemblerErrorCode> {
  override name = 'AssemblerError'
  override severity = Severity.Error
}

export function mergeErrors(errors: AssemblyError[]): void {
  const merged = new Map<string, AssemblyError>()

  errors.forEach((error) => {
    const key = `${error.code}:${error.message}`
    const existing = merged.get(key)

    if (existing) {
      if (Array.isArray(existing.loc)) {
        existing.loc = existing.loc.concat(error.loc)
      }
      else {
        existing.loc = [existing.loc].concat(error.loc)
      }
    }
    else {
      merged.set(key, error)
    }
  })

  errors.splice(0, errors.length, ...merged.values())
}
