interface Position {
  line: number
  column: number
}

export interface SourceLocation {
  start: Position
  end: Position
}

export interface Locatable {
  start: number
  end: number
  loc: SourceLocation
}
