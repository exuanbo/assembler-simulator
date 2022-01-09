import { ReactNode, memo, useState, useEffect, useRef } from 'react'
import { range, throttle } from '../utils'

const Dots = memo(() => (
  <>
    {range(3).map(index => (
      <span key={index} className="rounded-full bg-blue-gray-300 h-1 m-1 w-1" />
    ))}
  </>
))

interface Props {
  children: [left: ReactNode, right: ReactNode]
  className?: string
}

const ResizablePanel = ({ children, className = '' }: Props): JSX.Element => {
  const [leftWidthPct, setLeftWidthPct] = useState<number>(1)

  const [isDragging, setIsDragging] = useState(false)
  const dividerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (): void => {
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const handleMouseMove = throttle((event: MouseEvent) => {
      const { offsetWidth: dividerOffsetWidth } = dividerRef.current!
      const clientXAdjusted = event.clientX - dividerOffsetWidth /* / 2 */
      const widthAdjusted = document.body.offsetWidth - dividerOffsetWidth

      const percentage = clientXAdjusted / (widthAdjusted / 2)
      const percentageAdjusted = Math.max(0.5, Math.min(1.5, percentage))

      setLeftWidthPct(percentageAdjusted)
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
  }, [isDragging, leftWidthPct])

  return (
    <div className={`flex ${className}`}>
      <div className={isDragging ? 'cursor-col-resize inset-0 z-50 fixed' : 'hidden'} />
      <div
        style={{
          width: `${leftWidthPct * 50}%`
        }}>
        {children[0]}
      </div>
      <div
        ref={dividerRef}
        className={`border-l border-r cursor-col-resize flex-none flex flex-col bg-gray-100 items-center justify-center hover:bg-gray-400 ${
          isDragging ? 'bg-gray-400' : ''
        }`}
        onMouseDown={handleMouseDown}>
        <Dots />
      </div>
      <div className="flex-1">{children[1]}</div>
    </div>
  )
}

export default ResizablePanel
