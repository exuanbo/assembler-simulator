// Hide markers if any non-empty selection exists
// https://github.com/codemirror/view/blob/d67284f146b03cf78b73d1d03e703301522ab574/src/gutter.ts#L443-L464
// MIT Licensed https://github.com/codemirror/view/blob/d67284f146b03cf78b73d1d03e703301522ab574/LICENSE

import { Extension, Range, RangeSet } from '@codemirror/state'
import { EditorView, GutterMarker, gutterLineClass } from '@codemirror/view'
import { ClassName, InternalClassName } from './classNames'

class ActiveLineGutterMarker extends GutterMarker {
  public override elementClass = ClassName.ActiveLineGutter
}

const activeLineGutterMarker = new ActiveLineGutterMarker()

const activeLineGutterHighlighter = gutterLineClass.compute(['selection'], state => {
  const selectionRanges = state.selection.ranges
  if (selectionRanges.some(selectionRange => !selectionRange.empty)) {
    return RangeSet.empty
  }
  const markerRanges: Array<Range<ActiveLineGutterMarker>> = []
  const rangeCount = selectionRanges.length
  for (let lastLineFrom = -1, rangeIndex = 0; rangeIndex < rangeCount; rangeIndex++) {
    const selectionRange = selectionRanges[rangeIndex]
    const line = state.doc.lineAt(selectionRange.head)
    if (line.from > lastLineFrom) {
      markerRanges.push(activeLineGutterMarker.range(line.from))
      lastLineFrom = line.from
    }
  }
  return RangeSet.of(markerRanges)
})

export const highlightActiveLineGutter = (): Extension => {
  return [
    activeLineGutterHighlighter,
    EditorView.baseTheme({
      [`&.${InternalClassName.Focused} .${ClassName.ActiveLineGutter}`]: {
        color: '#4b5563' // gray-600
      },
      [`.${ClassName.ActiveLineGutter}`]: {
        backgroundColor: 'unset'
      }
    })
  ]
}
