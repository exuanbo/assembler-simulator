import { firstValueFrom } from 'rxjs'
import { describe, expect, it } from 'vitest'

import { Bus } from '../bus/bus'
import { Clock } from '../clock/clock'
import { Cpu } from '../cpu/cpu'
import { Memory } from '../memory/memory'
import { Controller } from './controller'

describe('Controller', () => {
  it('should step', async () => {
    const bus = new Bus()
    const memory = new Memory(bus)
    memory.load(new Uint8Array([0x01, 0x02]), 0x00)
    const controller = new Controller(
      bus,
      new Cpu(bus),
      new Clock(bus),
      memory,
    )
    await firstValueFrom(controller.step())
    expect(memory.getData()[0x02]).toBe(0x03)
  })
})
