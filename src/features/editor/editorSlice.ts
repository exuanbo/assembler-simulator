import { PayloadAction, createSlice, createSelector } from '@reduxjs/toolkit'
import type { EditorView } from '@codemirror/view'
import { LineLoc, lineRangesEqual } from './codemirror/line'
import type { RootState } from '@/app/store'
import type { SourceRange, Statement } from '@/features/assembler/core'
import { examples } from './examples'
import { range, curryRight2 } from '@/common/utils'

interface EditorState {
  input: string
  breakpoints: LineLoc[]
  activeRange: SourceRange | null
}

const initialState: EditorState = {
  input: examples[0].content,
  breakpoints: [],
  activeRange: null
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<{ value: string; isFromFile?: boolean }>) => {
      state.input = action.payload.value
    },
    setBreakpoints: (state, action: PayloadAction<LineLoc[]>) => {
      state.breakpoints = action.payload
    },
    addBreakpoint: (state, action: PayloadAction<LineLoc>) => {
      const targetLineLoc = action.payload
      const targetIndex = state.breakpoints.findIndex(lineLoc => lineLoc.from > targetLineLoc.from)
      if (targetIndex === -1) {
        state.breakpoints.push(targetLineLoc)
      } else {
        state.breakpoints.splice(targetIndex, 0, targetLineLoc)
      }
    },
    removeBreakpoint: (state, action: PayloadAction<LineLoc>) => {
      const targetLineLoc = action.payload
      const targetIndex = state.breakpoints.findIndex(lineLoc =>
        lineRangesEqual(lineLoc, targetLineLoc)
      )
      state.breakpoints.splice(targetIndex, 1)
    },
    setActiveRange: (state, action: PayloadAction<Statement>) => {
      const statement = action.payload
      state.activeRange = statement.range
    },
    clearActiveRange: state => {
      state.activeRange = null
    }
  }
})

export const selectEditortInput = (state: RootState): string => state.editor.input

export const selectEditorBreakpoints = (state: RootState): LineLoc[] => state.editor.breakpoints

const selectEditorActiveRange = (state: RootState): SourceRange | null => state.editor.activeRange

export const selectEditorActiveLinePos = curryRight2(
  createSelector([selectEditorActiveRange, (_, view?: EditorView) => view], (activeRange, view) => {
    if (activeRange === null || view === undefined) {
      return undefined
    }
    const linePos: number[] = []
    range(activeRange.from, activeRange.to + 1).forEach(pos => {
      if (pos <= view.state.doc.length) {
        const line = view.state.doc.lineAt(pos)
        if (!linePos.includes(line.from)) {
          linePos.push(line.from)
        }
      }
    })
    return linePos.length > 0 ? linePos : undefined
  })
)

export const selectEditorStateToPersist = createSelector(
  selectEditortInput,
  selectEditorBreakpoints,
  (input, breakpoints) => ({ input, breakpoints })
)

export const {
  setInput: setEditorInput,
  setBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  setActiveRange: setEditorActiveRange,
  clearActiveRange: clearEditorActiveRange
} = editorSlice.actions

export default editorSlice.reducer
