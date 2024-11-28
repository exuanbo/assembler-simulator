import { createContainer, Scope } from 'di-wise'
import { firstValueFrom } from 'rxjs'
import { describe, expect, it } from 'vitest'

import { Memory } from '../memory/memory'
import { Controller } from './controller'

describe('Controller', () => {
  it('should step', async () => {
    const container = createContainer({
      defaultScope: Scope.Container,
      autoRegister: true,
    })

    const memory = container.resolve(Memory)
    memory.load(new Uint8Array([0x01, 0x02]), 0x00)

    const controller = container.resolve(Controller)
    await firstValueFrom(controller.step())
    expect(memory.getData()[0x02]).toBe(0x03)
  })
})
