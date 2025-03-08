import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
  useMemo,
} from 'react'
import { Leaf, Trie } from './trie'
import { SequenceTracker } from './sequence'
import type { NormalizedHotkeyString } from './hotkey-utils'
import { isFormField } from './hotkey-utils'
import type { DependencyList } from 'react'

type HotkeyContextType = {
  isMetaKeyPressed: boolean
  registerHotkey: (hotkey: string, callback: (event?: KeyboardEvent) => void) => void
  unregisterHotkey: (hotkey: string) => void
  sequenceTrackerState: readonly NormalizedHotkeyString[]
}

const HotkeyContext = createContext<HotkeyContextType | null>(null)

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
  const [isMetaKeyPressed, setIsMetaKeyPressed] = useState(false)
  const trie = useRef<Trie>(new Trie())
  const sequenceTracker = useRef<SequenceTracker>(new SequenceTracker({
    onReset: () => {
      trie.current.reset()
    }
  }))

  const sequenceTrackerState = useSyncExternalStore(sequenceTracker.current.subscribe, () => sequenceTracker.current.path)

  const registerHotkey = useCallback((hotkey: string, callback: (event?: KeyboardEvent) => void) => {
    trie.current.add(hotkey, callback)
  }, [])

  const unregisterHotkey = useCallback((hotkey: string) => {
    trie.current.remove(hotkey)
  }, [])

  function handleKeyDown(event: KeyboardEvent) {
    if (isFormField(event.target as Node)) {
      return
    }

    if (event.metaKey) {
      setIsMetaKeyPressed(true)
    }

    if (event.target instanceof HTMLInputElement) {
      return
    }

    if (event.key === 'Escape') {
      sequenceTracker.current.reset()
      return
    }

    const node = trie.current.next(event.key);
    sequenceTracker.current.registerKeypress(event)

    // trie.current.render()

    if (node?.isLeaf()) {
      (node as Leaf).getCallback()?.(event)
      sequenceTracker.current.reset()
    }
  }

  function handleKeyUp() {
    setIsMetaKeyPressed(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    document.addEventListener('keydown', handleKeyDown, { signal: controller.signal })
    document.addEventListener('keyup', handleKeyUp, { signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [])


  const memoizedValue = useMemo(() => ({
    isMetaKeyPressed,
    sequenceTrackerState,
    registerHotkey,
    unregisterHotkey,
  }), [isMetaKeyPressed, registerHotkey, sequenceTrackerState, unregisterHotkey])

  return (
    <HotkeyContext.Provider value={memoizedValue}>
      {children}
    </HotkeyContext.Provider>
  )
}

export function useHotkey() {
  const context = useContext(HotkeyContext)
  if (!context) {
    throw new Error('useHotkey must be used within a HotkeyProvider')
  }
  return context
}

export function useRegisterHotkey(
  hotkey?: string,
  callback?: (event?: KeyboardEvent) => void,
  deps: DependencyList = [],
) {
  const { registerHotkey, unregisterHotkey } = useHotkey()


  useEffect(() => {
    if (!hotkey || !callback) {
      return
    }

    console.log('registerHotkey', hotkey);


    registerHotkey(hotkey, callback)

    return () => {
      unregisterHotkey(hotkey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerHotkey, unregisterHotkey, hotkey, callback, ...deps])
}
