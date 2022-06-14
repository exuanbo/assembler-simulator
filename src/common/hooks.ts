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
  callback: (event: MouseEvent) => void
): RefCallback<T> => {
  const [current, refCallback] = useRefCallback<T>()

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleClick = (event: MouseEvent): void => {
      const { target } = event
      if (target instanceof Node && !current.contains(target)) {
        callback(event)
      }
    }
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [current, callback])

  return refCallback
}

export const useHover = <T extends Element = Element>(
  delay?: number
): [isHovered: boolean, hoverRef: RefCallback<T>] => {
  const [current, refCallback] = useRefCallback<T>()
  const [isHovered, setHovered] = useState(false)

  const hoverTimeoutIdRef = useRef<number | undefined>()

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleMouseEnter = (): void => {
      if (delay === undefined) {
        setHovered(true)
      } else {
        hoverTimeoutIdRef.current = window.setTimeout(() => {
          setHovered(true)
          hoverTimeoutIdRef.current = undefined
        }, delay)
      }
    }
    const handleMouseLeave = (): void => {
      setHovered(false)
      if (hoverTimeoutIdRef.current !== undefined) {
        window.clearTimeout(hoverTimeoutIdRef.current)
        hoverTimeoutIdRef.current = undefined
      }
    }
    current.addEventListener('mouseenter', handleMouseEnter)
    current.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      setHovered(false)
      current.removeEventListener('mouseenter', handleMouseEnter)
      current.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [current, delay])

  return [isHovered, refCallback]
}
