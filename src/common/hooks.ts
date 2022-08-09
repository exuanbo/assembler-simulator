import { RefCallback, useState, useEffect, useReducer, useRef } from 'react'
import { isFunction } from './utils/common'

export const useToggle = (
  initialState: boolean
): [state: boolean, toggleState: React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

const nil = Symbol('nil')

export const useConstant = <T>(initialValue: T | (() => T)): T => {
  const ref = useRef<T | typeof nil>(nil)
  if (ref.current === nil) {
    // https://github.com/microsoft/TypeScript/issues/37663
    ref.current = isFunction(initialValue) ? initialValue() : initialValue
  }
  return ref.current
}

export const useRefCallback = <T>(): [T | null, RefCallback<T>] => useState<T | null>(null)

export const useOutsideClick = <T extends Element = Element>(
  handler: (event: MouseEvent) => void
): RefCallback<T> => {
  const [current, refCallback] = useRefCallback<T>()

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleClick = (event: MouseEvent): void => {
      if (
        event.target instanceof Element &&
        event.target !== current &&
        !current.contains(event.target)
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
  delay?: number
): RefCallback<T> => {
  const [current, refCallback] = useRefCallback<T>()

  const hoverContext = useConstant<{
    isHovered: boolean
    timeoutId?: number | undefined
  }>({
    isHovered: false
  })

  const clearHoverTimeout = (): void => {
    if (hoverContext.timeoutId !== undefined) {
      window.clearTimeout(hoverContext.timeoutId)
      hoverContext.timeoutId = undefined
    }
  }

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleMouseEnter = (): void => {
      if (delay === undefined) {
        handler(/* isHovered: */ true)
        hoverContext.isHovered = true
      } else {
        hoverContext.timeoutId = window.setTimeout(() => {
          handler(/* isHovered: */ true)
          hoverContext.isHovered = true
          hoverContext.timeoutId = undefined
        }, delay)
      }
    }
    const handleMouseLeave = (): void => {
      clearHoverTimeout()
      handler(/* isHovered: */ false)
      hoverContext.isHovered = false
    }
    current.addEventListener('mouseenter', handleMouseEnter)
    current.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      current.removeEventListener('mouseenter', handleMouseEnter)
      current.removeEventListener('mouseleave', handleMouseLeave)
      clearHoverTimeout()
      if (hoverContext.isHovered) {
        handler(/* isHovered: */ false)
        hoverContext.isHovered = false
      }
    }
  }, [current, handler, delay])

  return refCallback
}
