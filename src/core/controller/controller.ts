import { Observable, type Subscription } from 'rxjs'

import type { Bus, ControlLines } from '../bus/bus'
import type { Clock } from '../clock/clock'
import type { Cpu } from '../cpu/cpu'
import type { Memory } from '../memory/memory'

export class Controller {
  constructor(
    private readonly bus: Bus,
    private readonly cpu: Cpu,
    private readonly clock: Clock,
    private readonly memory: Memory,
  ) {}

  step = (): Observable<void> => {
    return new Observable<void>((subscriber) => {
      const step = this.cpu.step()
      let subscription: Subscription

      const handleResult = (result: IteratorResult<Observable<ControlLines>, void>) => {
        if (result.done) {
          subscriber.next()
          subscriber.complete()
          return
        }
        queueMicrotask(this.clock.tick)
        subscription = result.value.subscribe((signals) => {
          handleResult(step.next(signals))
        })
      }

      handleResult(step.next())
      return () => subscription.unsubscribe()
    })
  }
}
