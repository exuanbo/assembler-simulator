export function parseHexNumber(text: string): number {
  // TODO: explain in comment
  return Number('0x' + text)
}

const escapeChars: Record<string, string> = {
  '0': '\0',
  't': '\t',
  'n': '\n',
  'r': '\r',
  '"': '"',
  '\\': '\\',
}

export function parseString(text: string): string {
  let result = ''
  let i = 1
  const len = text.length - 1

  while (i < len) {
    const char = text[i]
    if (char === '\\') {
      const nextChar = text[++i]
      result += (escapeChars[nextChar] || nextChar)
    }
    else {
      result += char
    }
    i++
  }

  return result
}
