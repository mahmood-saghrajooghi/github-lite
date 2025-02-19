import { useEffect, useState, useCallback } from 'react'

export function useIsPressing(hotkey: string) {
  const [isPressing, setIsPressing] = useState(false)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === hotkey) {
      setIsPressing(true)
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
