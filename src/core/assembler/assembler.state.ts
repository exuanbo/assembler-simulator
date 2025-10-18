import { createContext } from '@/common/utils/context'

import { getSize } from './assembler.utils'
import type { AssemblyNode } from './assemblyunit'
import type * as AST from './ast'
import { AssemblerError, ErrorCode } from './errors'

const MAX_MEMORY_ADDRESS = 0xff

export interface AssemblerState {
  get address(): number
  setAddress(node: AST.Immediate): void
  advanceAddress(node: AssemblyNode): void
}

export function createAssemblerState(initialAddress = 0): AssemblerState {
  let address = initialAddress
  return {
    get address() {
      return address
    },
    setAddress({ children: [value], loc }) {
      if (value > MAX_MEMORY_ADDRESS) {
        throw new AssemblerError(ErrorCode.MemoryOverflow, loc)
      }
      address = value
    },
    advanceAddress(node) {
      const nextAddress = address + getSize(node)
      if (nextAddress > MAX_MEMORY_ADDRESS) {
        throw new AssemblerError(ErrorCode.MemoryOverflow, node.loc)
      }
      address = nextAddress
    },
  }
}

export const AssemblerState = createContext<AssemblerState>()
