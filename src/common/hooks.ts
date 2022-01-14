import { RefCallback, useState, useEffect, useReducer, useCallback, useRef } from 'react'

export const useConstant = <T>(initialValue: T | (() => T)): T => useState(initialValue)[0]

export const useToggle = (
  initialState: boolean
): [state: boolean, toggleState: React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

export const useOutsideClick = <T extends HTMLElement = HTMLElement>(): [
  isClicked: boolean,
  clickRef: RefCallback<T>
] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isClicked, setClicked] = useState(false)

  const refCallback = useCallback<RefCallback<T>>(node => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleOutsideClick = ({ target }: MouseEvent): void => {
      if (target instanceof Element) {
        setClicked(!current.contains(target))
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      setClicked(false)
    }
  }, [current])

  return [isClicked, refCallback]
}

export const useHover = <T extends HTMLElement = HTMLElement>(
  delay?: number
): [isHovered: boolean, hoverRef: RefCallback<T>] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isHovered, setHovered] = useState(false)

  const refCallback = useCallback<RefCallback<T>>(node => {
    setCurrent(node)
  }, [])

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
