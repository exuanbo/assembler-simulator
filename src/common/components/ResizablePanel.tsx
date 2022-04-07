import { ReactNode, useState, useEffect, useRef } from 'react'
import { clamp, range, throttle } from '../utils'

const MIN_WIDTH_PERCENTAGE = 0.25
const MAX_WIDTH_PERCENTAGE = 0.75

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
      window.clearTimeout(clickTimeoutIdRef.current)
      clickCountRef.current = 0
    } else {
      clickTimeoutIdRef.current = window.setTimeout(() => {
        clickCountRef.current = 0
      }, 500)
    }
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
    <>
      <div ref={wrapperRef} className={`flex ${className}`}>
        {isReady && <div style={{ width: leftWidth }}>{children[0]}</div>}
        <div
          ref={dividerRef}
          className={`border-r border-l cursor-col-resize flex-none flex flex-col space-y-2 px-1 items-center justify-center group hover:bg-gray-200 ${
            isReady ? (isDragging ? 'bg-gray-200' : 'bg-gray-100') : 'invisible'
          }`}
          onMouseDown={handleMouseDown}>
          {range(3).map(index => (
            <span
              key={index}
              className={`rounded-full h-1 w-1 group-hover:bg-slate-400 ${
                isDragging ? 'bg-slate-400' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
        {isReady && <div className="flex-1">{children[1]}</div>}
      </div>
      <div className={isDragging ? 'cursor-col-resize inset-0 z-10 fixed' : 'hidden'} />
    </>
  )
}

export default ResizablePanel
