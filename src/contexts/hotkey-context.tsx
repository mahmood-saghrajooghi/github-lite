import { isHotkey } from 'is-hotkey'
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'

type HotkeyContextType = {
  isMetaKeyPressed: boolean
  registerHotkey: (hotkey: string, callback: () => void) => void
  unregisterHotkey: (hotkey: string) => void
  resetFocus: () => void
}

const HotkeyContext = createContext<HotkeyContextType>({
  isMetaKeyPressed: false,
  registerHotkey: () => { },
  unregisterHotkey: () => { },
  resetFocus: () => { },
})

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isMetaKeyPressed, setIsMetaKeyPressed] = useState(false)
  const hotkeysRef = useRef<Record<string, () => void>>({})

  const registerHotkey = useCallback((hotkey: string, callback: () => void) => {
    hotkeysRef.current[hotkey] = callback
  }, [])

  const unregisterHotkey = useCallback((hotkey: string) => {
    delete hotkeysRef.current[hotkey]
  }, [])

  const resetFocus = useCallback(() => {
    if (ref.current) {
      ref.current.focus()
    }
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.metaKey) {
      setIsMetaKeyPressed(true)
    }

    if (event.target instanceof HTMLInputElement) {
      return
    }

    for (const hotkey in hotkeysRef.current) {
      if (isHotkey(hotkey, event)) {
        const callback = hotkeysRef.current[hotkey]
        if (callback) {
          callback()
          event.preventDefault()
        }
      }
    }
  }

  function handleKeyUp() {
    setIsMetaKeyPressed(false)
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.focus()
    }
  }, [])

  return (
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} ref={ref} tabIndex={0}>
      <HotkeyContext.Provider
        value={{
          isMetaKeyPressed,
          registerHotkey,
          unregisterHotkey,
          resetFocus
        }}>
        {children}
      </HotkeyContext.Provider>
    </div>
  )
}

export function useHotkey() {
  const context = useContext(HotkeyContext)
  if (!context) {
    throw new Error('useHotkey must be used within a HotkeyProvider')
  }
  return context
}

export function useRegisterHotkey(hotkey?: string, callback?: () => void) {
  const { registerHotkey, unregisterHotkey } = useHotkey()


  useEffect(() => {
    if (!hotkey || !callback) {
      return
    }

    registerHotkey(hotkey, callback)

    return () => {
      unregisterHotkey(hotkey)
    }
  }, [registerHotkey, unregisterHotkey, hotkey, callback])
}
