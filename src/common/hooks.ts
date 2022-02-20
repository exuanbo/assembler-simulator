import { RefCallback, useState, useEffect, useReducer, useCallback, useRef } from 'react'

export const useConstant = <T>(initialValue: T | (() => T)): T => useState(initialValue)[0]

export const useToggle = (
  initialState: boolean
): [state: boolean, toggleState: React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

export const useRefCallback = <T extends Element = Element>(): [T | null, RefCallback<T>] => {
  const [current, setCurrent] = useState<T | null>(null)
  const refCallback = useCallback<RefCallback<T>>(element => {
    setCurrent(element)
  }, [])
  return [current, refCallback]
}

export const useOutsideClick = <T extends Element = Element>(
  onClickOutside: (event: MouseEvent) => void
): RefCallback<T> => {
  const [current, refCallback] = useRefCallback<T>()

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleClick = (event: MouseEvent): void => {
      const { target } = event
      if (target instanceof Node && !current.contains(target)) {
        onClickOutside(event)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [current, onClickOutside])

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
      current.removeEventListener('mouseenter', handleMouseEnter)
      current.removeEventListener('mouseleave', handleMouseLeave)

      setHovered(false)
    }
  }, [current, delay])

  return [isHovered, refCallback]
}
