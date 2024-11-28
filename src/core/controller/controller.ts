import { inject } from 'di-wise'
import { Observable, type Subscription } from 'rxjs'

import { Bus } from '../bus/bus'
import { Clock } from '../clock/clock'
import { Cpu } from '../cpu/cpu'
import { Memory } from '../memory/memory'

export class Controller {
  private bus = inject(Bus)
  private cpu = inject(Cpu)
  private clock = inject(Clock)
  private memory = inject(Memory)

  step = (): Observable<void> => {
    return new Observable<void>((subscriber) => {
      const step = this.cpu.step()
      let subscription: Subscription | undefined

      const handleResult = (result: ReturnType<typeof step.next>) => {
        if (result.done) {
          subscriber.next()
          subscriber.complete()
          return
        }
        queueMicrotask(this.clock.tick)
        subscription?.unsubscribe()
        subscription = result.value.subscribe((signals) => {
          handleResult(step.next(signals))
        })
      }

      handleResult(step.next())
      return () => subscription?.unsubscribe()
    })
  }
}
