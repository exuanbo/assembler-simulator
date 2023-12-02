// Hide decorations if any non-empty selection exists
// https://github.com/codemirror/view/blob/5989c150d65172c36917d8bd2ea04316a79f20ed/src/active-line.ts
// MIT Licensed https://github.com/codemirror/view/blob/5989c150d65172c36917d8bd2ea04316a79f20ed/LICENSE

import type { Extension, Range } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'

import { ClassName, InternalClassName } from './classNames'

const lineDecoration = Decoration.line({ class: ClassName.ActiveLine })

const highlightActiveLinePlugin = ViewPlugin.fromClass(
  class PluginValue {
    private _decorations: DecorationSet

    public get decorations(): DecorationSet {
      return this._decorations
    }

    constructor(view: EditorView) {
      this._decorations = this.getDecorations(view)
    }

    public update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet) {
        this._decorations = this.getDecorations(update.view)
      }
    }

    private getDecorations(view: EditorView): DecorationSet {
      const selectionRanges = view.state.selection.ranges
      if (selectionRanges.some((selectionRange) => !selectionRange.empty)) {
        return Decoration.none
      }
      const decorationRanges: Array<Range<Decoration>> = []
      const rangeCount = selectionRanges.length
      for (let lastLineFrom = -1, rangeIndex = 0; rangeIndex < rangeCount; rangeIndex++) {
        const selectionRange = selectionRanges[rangeIndex]
        const line = view.state.doc.lineAt(selectionRange.head)
        if (line.from > lastLineFrom) {
          decorationRanges.push(lineDecoration.range(line.from))
          lastLineFrom = line.from
        }
      }
      return Decoration.set(decorationRanges)
    }
  },
  {
    decorations: (pluginValue) => pluginValue.decorations,
  },
)

export const highlightActiveLine = (): Extension => {
  return [
    highlightActiveLinePlugin,
    EditorView.baseTheme({
      [`&.${InternalClassName.Focused} .${ClassName.ActiveLine}`]: {
        boxShadow: 'inset 0 0 0 2px #e5e7eb',
      },
      [`.${ClassName.ActiveLine}`]: {
        backgroundColor: 'unset',
      },
    }),
  ]
}
