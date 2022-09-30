// Hide decorations if any non-empty selection exists
// https://github.com/codemirror/view/blob/5989c150d65172c36917d8bd2ea04316a79f20ed/src/active-line.ts
// MIT Licensed https://github.com/codemirror/view/blob/5989c150d65172c36917d8bd2ea04316a79f20ed/LICENSE

import type { Extension, Range } from '@codemirror/state'
import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet } from '@codemirror/view'

const lineDecoration = Decoration.line({ class: 'cm-activeLine' })

const highlightActiveLinePlugin = ViewPlugin.fromClass(
  class PluginValue {
    private _decorationSet: DecorationSet

    constructor(view: EditorView) {
      this._decorationSet = this.getDecorationSet(view)
    }

    public get decorationSet(): DecorationSet {
      return this._decorationSet
    }

    public update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet) {
        this._decorationSet = this.getDecorationSet(update.view)
      }
    }

    private getDecorationSet(view: EditorView): DecorationSet {
      const selectionRanges = view.state.selection.ranges
      if (selectionRanges.some(selectionRange => !selectionRange.empty)) {
        return Decoration.none
      } else {
        const decorationRanges: Array<Range<Decoration>> = []
        const rangeCount = selectionRanges.length
        for (let lastLineFrom = -1, rangeIndex = 0; rangeIndex < rangeCount; rangeIndex++) {
          const line = view.lineBlockAt(selectionRanges[rangeIndex].head)
          if (line.from > lastLineFrom) {
            decorationRanges.push(lineDecoration.range(line.from))
            lastLineFrom = line.from
          }
        }
        return Decoration.set(decorationRanges)
      }
    }
  },
  {
    decorations: pluginValue => pluginValue.decorationSet
  }
)

export const highlightActiveLine = (): Extension => {
  return [
    highlightActiveLinePlugin,
    EditorView.baseTheme({
      '&.cm-focused .cm-activeLine': {
        boxShadow: 'inset 0 0 0 2px #e5e7eb'
      },
      '.cm-activeLine': {
        backgroundColor: 'initial'
      }
    })
  ]
}
