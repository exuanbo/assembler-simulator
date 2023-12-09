import type { EditorView, ViewUpdate } from '@codemirror/view'
import { addUpdateListener } from '@codemirror-toolkit/extensions'
import { Observable } from 'rxjs'

export const onUpdate = (view: EditorView): Observable<ViewUpdate> =>
  new Observable((subscriber) => {
    return addUpdateListener(view, (update) => {
      subscriber.next(update)
    })
  })
