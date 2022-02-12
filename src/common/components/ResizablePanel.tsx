import { ReactNode, memo, useState, useEffect, useRef } from 'react'
import { clamp, range, throttle } from '../utils'

const MIN_WIDTH_PERCENTAGE = 0.25
const MAX_WIDTH_PERCENTAGE = 0.75

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
  const [leftWidth, setLeftWidth] = useState<number>()
  const [isReady, setReady] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)

  const getDividerWidth = (): number => dividerRef.current!.offsetWidth

  const getTotalWidthAdjusted = (): number => wrapperRef.current!.offsetWidth - getDividerWidth()

  const getInitialLeftWidth = (): number => 0.5 * getTotalWidthAdjusted()

  useEffect(() => {
    setLeftWidth(getInitialLeftWidth())
    setReady(true)
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
      const dividerWidth = getDividerWidth()
      const clientXAdjusted = event.clientX - dividerWidth / 2

      const totalWidthAdjusted = getTotalWidthAdjusted()

      const percentage = clientXAdjusted / totalWidthAdjusted
      const percentageAdjusted = clamp(percentage, MIN_WIDTH_PERCENTAGE, MAX_WIDTH_PERCENTAGE)

      const widthAdjusted = percentageAdjusted * totalWidthAdjusted
      setLeftWidth(widthAdjusted)
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
      {isReady && <div style={{ width: leftWidth }}>{children[0]}</div>}
      <div
        ref={dividerRef}
        className={`border-l border-r cursor-col-resize flex-none flex flex-col items-center justify-center group hover:bg-gray-200 ${
          isReady ? (isDragging ? 'bg-gray-200' : 'bg-gray-100') : 'invisible'
        }`}
        onMouseDown={handleMouseDown}>
        <Dots isHovered={isDragging} />
      </div>
      {isReady && <div className="flex-1">{children[1]}</div>}
      <div className={isDragging ? 'cursor-col-resize inset-0 z-10 fixed' : 'hidden'} />
    </div>
  )
}

export default ResizablePanel
