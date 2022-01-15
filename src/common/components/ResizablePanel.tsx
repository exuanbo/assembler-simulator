import { ReactNode, memo, useState, useEffect, useRef } from 'react'
import { range, throttle } from '../utils'

const Dots = memo(({ isHovered }: { isHovered: boolean }) => (
  <>
    {range(3).map(index => (
      <span
        key={index}
        className={`rounded-full h-1 m-1 w-1 group-hover:bg-blue-gray-400 ${
          isHovered ? 'bg-blue-gray-400' : 'bg-blue-gray-300'
        }`}
      />
    ))}
  </>
))

interface Props {
  children: [left: ReactNode, right: ReactNode]
  className?: string
}

const ResizablePanel = ({ children, className = '' }: Props): JSX.Element => {
  const [leftWidth, setLeftWidth] = useState('')
  const [showChildren, setShowChildren] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)

  const getInitialLeftWidth = (): string =>
    `${0.5 * (wrapperRef.current!.offsetWidth - dividerRef.current!.offsetWidth)}px`

  useEffect(() => {
    setLeftWidth(getInitialLeftWidth())
    setShowChildren(true)
  }, [])

  const [isDragging, setIsDragging] = useState(false)

  const clickCountRef = useRef(0)
  const clickTimeoutIdRef = useRef<number>()

  const handleMouseDown = (): void => {
    setIsDragging(true)

    clickCountRef.current += 1
    if (clickCountRef.current === 2) {
      setLeftWidth(getInitialLeftWidth())
      clickCountRef.current = 0
      window.clearTimeout(clickTimeoutIdRef.current)
      return
    }
    clickTimeoutIdRef.current = window.setTimeout(() => {
      clickCountRef.current = 0
    }, 500)
  }

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const handleMouseMove = throttle((event: MouseEvent) => {
      const { offsetWidth: dividerOffsetWidth } = dividerRef.current!
      const clientXAdjusted = event.clientX - dividerOffsetWidth / 2
      const wrapperWidthAdjusted = wrapperRef.current!.offsetWidth - dividerOffsetWidth

      const percentage = clientXAdjusted / wrapperWidthAdjusted
      const percentageAdjusted = Math.max(0.25, Math.min(0.75, percentage))

      const widthAdjusted = percentageAdjusted * wrapperWidthAdjusted
      setLeftWidth(`${widthAdjusted}px`)
    }, 10)

    const handleMouseUp = (): void => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, leftWidth])

  return (
    <div ref={wrapperRef} className={`flex ${className}`}>
      <div className={isDragging ? 'cursor-col-resize inset-0 z-50 fixed' : 'hidden'} />
      {showChildren && <div style={{ width: leftWidth }}>{children[0]}</div>}
      <div
        ref={dividerRef}
        className={`border-l border-r cursor-col-resize flex-none flex flex-col items-center justify-center group hover:bg-gray-200 ${
          isDragging ? 'bg-gray-200' : 'bg-gray-100'
        }`}
        onMouseDown={handleMouseDown}>
        <Dots isHovered={isDragging} />
      </div>
      {showChildren && <div className="flex-1">{children[1]}</div>}
    </div>
  )
}

export default ResizablePanel
