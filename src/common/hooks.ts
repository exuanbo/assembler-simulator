import { useState, useEffect, useReducer, useCallback } from 'react'

export const useToggle = (initialState: boolean): [boolean, React.DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

type RefCallback<T> = (node: T) => void

export const useOutsideClick = <T extends Element = Element>(): [
  clickRef: RefCallback<T>,
  isClicked: boolean
] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isClicked, setClicked] = useState<boolean>(false)

  const refCallback = useCallback((node: T) => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current !== null) {
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
    }
  }, [current])

  return [refCallback, isClicked]
}

export const useHover = <T extends Element = Element>(): [
  hoverRef: RefCallback<T>,
  isHovered: boolean
] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isHovered, setHovered] = useState<boolean>(false)

  const refCallback = useCallback((node: T) => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current !== null) {
      const handleMouseEnter = (): void => setHovered(true)
      const handleMouseLeave = (): void => setHovered(false)

      current.addEventListener('mouseenter', handleMouseEnter)
      current.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        setHovered(false)

        current.removeEventListener('mouseenter', handleMouseEnter)
        current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [current])

  return [refCallback, isHovered]
}
