import {
  type RefCallback,
  useCallback,
  useEffect,
  useInsertionEffect,
  useReducer,
  useRef,
  useState,
} from 'react'

import { isFunction } from './utils/common'

export const useToggle = (
  initialState: boolean,
): [state: boolean, toggleState: React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

export const useSingleton = <T extends {}>(instance: T | (() => T)): T => {
  const instanceRef = useRef<T | null>(null)
  if (instanceRef.current === null) {
    // https://github.com/microsoft/TypeScript/issues/37663
    instanceRef.current = isFunction(instance) ? instance() : instance
  }
  return instanceRef.current
}

export const useRefCallback = <T>(): [T | null, RefCallback<T>] => useState<T | null>(null)

// https://github.com/SukkaW/foxact/blob/master/src/use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired/index.ts
export const useStableHandler = <A extends unknown[], R>(
  callback: (...args: A) => R,
): typeof callback => {
  const callbackRef = useRef<typeof callback>(null!)
  useInsertionEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback<typeof callback>((...args) => {
    const fn = callbackRef.current
    return fn(...args)
  }, [])
}

export const useOutsideClick = <T extends Element = Element>(
  handler: (event: MouseEvent) => void,
): RefCallback<T> => {
  const [current, refCallback] = useRefCallback<T>()

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleClick = (event: MouseEvent): void => {
      if (
        event.target instanceof Element
        && event.target !== current
        && !current.contains(event.target)
      ) {
        handler(event)
      }
    }
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [current, handler])

  return refCallback
}

export const useHover = <T extends Element = Element>(
  handler: (isHovered: boolean) => void,
  delay?: number,
): RefCallback<T> => {
  const [current, refCallback] = useRefCallback<T>()

  const mutableState = useSingleton<{
    isHovered: boolean
    timeoutId?: number | undefined
  }>({
    isHovered: false,
  })

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleMouseEnter = (): void => {
      if (delay === undefined) {
        handler(/* isHovered: */ true)
        mutableState.isHovered = true
      }
      else {
        mutableState.timeoutId = window.setTimeout(() => {
          handler(/* isHovered: */ true)
          mutableState.isHovered = true
        }, delay)
      }
    }
    const clearHoverTimeout = (): void => {
      window.clearTimeout(mutableState.timeoutId)
    }
    const handleMouseLeave = (): void => {
      clearHoverTimeout()
      handler(/* isHovered: */ false)
      mutableState.isHovered = false
    }
    current.addEventListener('mouseenter', handleMouseEnter)
    current.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      current.removeEventListener('mouseenter', handleMouseEnter)
      current.removeEventListener('mouseleave', handleMouseLeave)
      clearHoverTimeout()
      if (mutableState.isHovered) {
        handler(/* isHovered: */ false)
        mutableState.isHovered = false
      }
    }
  }, [current, delay, handler, mutableState])

  return refCallback
}
