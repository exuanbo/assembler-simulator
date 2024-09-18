import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import { addExtension, removeExtension } from '@codemirror-toolkit/extensions'
import { BehaviorSubject, filter, from, map, tap } from 'rxjs'

const vim$ = new BehaviorSubject<Extension | null>(null)

export function enableVim(view: EditorView) {
  return from(import('@replit/codemirror-vim')).pipe(
    map(({ vim }) => vim({ status: true })),
    tap((ext) => vim$.next(ext)),
    tap((ext) => addExtension(view, ext)),
  )
}

export function disableVim(view: EditorView) {
  return vim$.pipe(
    filter(Boolean),
    tap(() => vim$.next(null)),
    tap((ext) => removeExtension(view, ext)),
  )
}
