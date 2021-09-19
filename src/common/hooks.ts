import { useState, useEffect, useReducer, useCallback } from 'react'

export const useToggle = (
  initialState: boolean
): [state: boolean, toggleState: React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

type RefCallback<T> = (node: T) => void

export const useOutsideClick = <T extends Element = Element>(): [
  isClicked: boolean,
  clickRef: RefCallback<T>
] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isClicked, setClicked] = useState<boolean>(false)

  const refCallback = useCallback((node: T) => {
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
      setClicked(false)
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [current])

  return [isClicked, refCallback]
}

export const useHover = <T extends Element = Element>(): [
  isHovered: boolean,
  hoverRef: RefCallback<T>
] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isHovered, setHovered] = useState<boolean>(false)

  const refCallback = useCallback((node: T) => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleMouseEnter = (): void => setHovered(true)
    const handleMouseLeave = (): void => setHovered(false)

    current.addEventListener('mouseenter', handleMouseEnter)
    current.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      setHovered(false)

      current.removeEventListener('mouseenter', handleMouseEnter)
      current.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [current])

  return [isHovered, refCallback]
}
