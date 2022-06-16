import { RefCallback, useState, useEffect, useReducer, useRef } from 'react'

export const useToggle = (
  initialState: boolean
): [state: boolean, toggleState: React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

const nil = Symbol('nil')

export const useConstant = <T>(initialValue: T | (() => T)): T => {
  const ref = useRef<T | typeof nil>(nil)
  if (ref.current === nil) {
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/37663#issue-589577681
    ref.current = typeof initialValue === 'function' ? initialValue() : initialValue
  }
  // @ts-expect-error same as above
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
      const { target } = event
      if (target instanceof Node && !current.contains(target)) {
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

  const isHoveredRef = useRef(false)
  const hoverTimeoutIdRef = useRef<number | undefined>()

  const clearHoverTimeout = (): void => {
    if (hoverTimeoutIdRef.current !== undefined) {
      window.clearTimeout(hoverTimeoutIdRef.current)
      hoverTimeoutIdRef.current = undefined
    }
  }

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleMouseEnter = (): void => {
      if (delay === undefined) {
        handler(/* isHovered: */ true)
        isHoveredRef.current = true
      } else {
        hoverTimeoutIdRef.current = window.setTimeout(() => {
          handler(/* isHovered: */ true)
          isHoveredRef.current = true
          hoverTimeoutIdRef.current = undefined
        }, delay)
      }
    }
    const handleMouseLeave = (): void => {
      clearHoverTimeout()
      handler(/* isHovered: */ false)
      isHoveredRef.current = false
    }
    current.addEventListener('mouseenter', handleMouseEnter)
    current.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      clearHoverTimeout()
      if (isHoveredRef.current) {
        handler(/* isHovered: */ false)
        isHoveredRef.current = false
      }
      current.removeEventListener('mouseenter', handleMouseEnter)
      current.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [current, handler, delay])

  return refCallback
}
