import { useEffect, useState, useCallback } from 'react'
import { isFormField } from '../contexts/hotkey-utils'

export function useIsPressing(hotkey: string) {
  const [isPressing, setIsPressing] = useState(false)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === hotkey) {
      if (!isFormField(event.target as Node)) {
        setIsPressing(true)
      }
    }
  }, [hotkey])

  const handleKeyUp = useCallback(() => {
    setIsPressing(false)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    document.addEventListener('keydown', handleKeyDown, { signal: controller.signal })
    document.addEventListener('keyup', handleKeyUp, { signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [handleKeyDown, handleKeyUp, hotkey])

  return isPressing
}
