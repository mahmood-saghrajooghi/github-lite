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
import { HotkeyVisualizer } from '../components/hotkey-visualizer'
import { HotkeyReference } from '../components/hotkey-reference'

type HotkeyInfo = {
  key: string
  description?: string
}

type HotkeyContextType = {
  isMetaKeyPressed: boolean
  registerHotkey: (hotkey: string, callback: (event?: KeyboardEvent) => void, descriptions?: Record<string, string>) => void
  unregisterHotkey: (hotkey: string) => void
  sequenceTrackerState: readonly NormalizedHotkeyString[]
  isVisualizerOpen: boolean
  toggleVisualizer: () => void
  getAvailableHotkeys: () => HotkeyInfo[]
  currentTrieState: ReturnType<Trie['getCurrentNode']>
  getCurrentNodeDescription: () => string | undefined
  isReferenceOpen: boolean
  toggleReference: () => void
  getAllHotkeys: () => Array<{ sequence: string; description?: string }>
}

const HotkeyContext = createContext<HotkeyContextType | null>(null)

export function HotkeyProvider({ children }: { children: React.ReactNode }) {
  const [isMetaKeyPressed, setIsMetaKeyPressed] = useState(false)
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false)
  const [isReferenceOpen, setIsReferenceOpen] = useState(false)
  const trie = useRef<Trie>(new Trie())
  const sequenceTracker = useRef<SequenceTracker>(new SequenceTracker({
    onReset: () => {
      trie.current.reset()
      setIsVisualizerOpen(false)
    }
  }))

  const sequenceTrackerState = useSyncExternalStore(sequenceTracker.current.subscribe, () => sequenceTracker.current.path)
  const currentTrieState = useSyncExternalStore(trie.current.subscribe, () => trie.current.getCurrentNode())

  const registerHotkey = useCallback((hotkey: string, callback: (event?: KeyboardEvent) => void, descriptions?: Record<string, string>) => {
    trie.current.add(hotkey, callback, descriptions)
  }, [])

  const unregisterHotkey = useCallback((hotkey: string) => {
    trie.current.remove(hotkey)
  }, [])

  const toggleVisualizer = useCallback(() => {
    setIsVisualizerOpen(prev => !prev)
  }, [])

  const toggleReference = useCallback(() => {
    setIsReferenceOpen(prev => !prev)
  }, [])

  const getAvailableHotkeys = useCallback((): HotkeyInfo[] => {
    const currentNode = trie.current.getCurrentNode()
    return Object.entries(currentNode.children)
      .map(([key, node]) => ({
        key,
        description: node.description
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [currentTrieState])

  const getAllHotkeys = useCallback(() => {
    return trie.current.getAllHotkeys()
  }, [])

  const getCurrentNodeDescription = useCallback(() => {
    return trie.current.getCurrentNode().description
  }, [currentTrieState])

  function handleKeyDown(event: KeyboardEvent) {
    if (event.metaKey) {
      setIsMetaKeyPressed(true)
    }

    // Toggle reference with Shift+'?' key (when not in form fields)
    if (event.key === '?' && event.shiftKey && !isFormField(event.target as Node)) {
      event.preventDefault()
      toggleReference()
      return
    }

    if (isFormField(event.target as Node)) {
      return
    }

    if (event.target instanceof HTMLInputElement) {
      return
    }

    if (event.key === 'Escape') {
      sequenceTracker.current.reset()
      // Also close visualizer and reference on Escape
      if (isVisualizerOpen) {
        setIsVisualizerOpen(false)
      }
      if (isReferenceOpen) {
        setIsReferenceOpen(false)
      }
      return
    }

    const node = trie.current.next(event.key);
    sequenceTracker.current.registerKeypress(event)

    // trie.current.render()

    if (node?.isLeaf()) {
      // When the callback navigates to a page that has an input with autofocus, the key press is
      // registered in the input and it's value changes which is not intended. So we need to wait
      // for the next tick to make sure that all the events related to the key press are processed
      // before the callback is called.
      setTimeout(() => {
        (node as Leaf).getCallback()?.(event)
        sequenceTracker.current.reset()
      }, 0)
      // Close visualizer when we reach a leaf
      setIsVisualizerOpen(false)
    } else if (node) {
      // We have an intermediate node with children, show the visualizer
      setIsVisualizerOpen(true)
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
  }, [isVisualizerOpen, toggleVisualizer, isReferenceOpen, toggleReference])


  const memoizedValue = useMemo(() => ({
    isMetaKeyPressed,
    sequenceTrackerState,
    registerHotkey,
    unregisterHotkey,
    isVisualizerOpen,
    toggleVisualizer,
    getAvailableHotkeys,
    currentTrieState,
    getCurrentNodeDescription,
    isReferenceOpen,
    toggleReference,
    getAllHotkeys,
  }), [isMetaKeyPressed, registerHotkey, sequenceTrackerState, unregisterHotkey, isVisualizerOpen, toggleVisualizer, getAvailableHotkeys, currentTrieState, getCurrentNodeDescription, isReferenceOpen, toggleReference, getAllHotkeys])

  return (
    <HotkeyContext.Provider value={memoizedValue}>
      {children}
      <HotkeyVisualizer />
      <HotkeyReference />
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
  descriptions?: Record<string, string>,
  deps: DependencyList = [],
) {
  const { registerHotkey, unregisterHotkey } = useHotkey()


  useEffect(() => {
    if (!hotkey || !callback) {
      return
    }

    registerHotkey(hotkey, callback, descriptions)

    return () => {
      unregisterHotkey(hotkey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerHotkey, unregisterHotkey, hotkey, callback, descriptions, ...deps])
}
