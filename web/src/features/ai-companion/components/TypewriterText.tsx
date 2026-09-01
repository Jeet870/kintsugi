import React, { useState, useEffect, useRef } from 'react'

export interface TypewriterTextProps {
  text: string
  speed?: number
  isNew?: boolean
  onComplete?: () => void
}

export const TypewriterText: React.FC<TypewriterTextProps> = React.memo(
  ({ text, speed = 15, isNew = false, onComplete }) => {
    const [displayedText, setDisplayedText] = useState<string>(isNew ? '' : text)
    const completedRef = useRef<boolean>(!isNew)

    useEffect(() => {
      if (!isNew || completedRef.current) {
        setDisplayedText(text)
        return
      }

      let idx = 0
      setDisplayedText('')

      const interval = setInterval(() => {
        idx += 2
        if (idx >= text.length) {
          setDisplayedText(text)
          completedRef.current = true
          clearInterval(interval)
          onComplete?.()
        } else {
          setDisplayedText(text.slice(0, idx))
        }
      }, speed)

      return () => {
        clearInterval(interval)
      }
    }, [text, speed, isNew, onComplete])

    return <span>{displayedText}</span>
  },
)

TypewriterText.displayName = 'TypewriterText'
export default TypewriterText
