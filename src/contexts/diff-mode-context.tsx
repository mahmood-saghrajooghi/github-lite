import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * Diff mode types
 */
export type DiffMode = 'traditional' | 'structural'

/**
 * Context value type
 */
interface DiffModeContextValue {
  mode: DiffMode
  setMode: (mode: DiffMode) => void
  toggleMode: () => void
}

/**
 * Context for managing diff mode preference
 */
const DiffModeContext = createContext<DiffModeContextValue | undefined>(undefined)

/**
 * Local storage key for persisting mode preference
 */
const STORAGE_KEY = 'github-lite:diff-mode'

/**
 * Provider component for diff mode context
 */
export function DiffModeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or default to 'traditional'
  const [mode, setModeState] = useState<DiffMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'structural' || stored === 'traditional') {
        return stored
      }
    } catch (error) {
      console.warn('Failed to read diff mode from localStorage:', error)
    }
    return 'traditional'
  })

  // Persist to localStorage whenever mode changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch (error) {
      console.warn('Failed to save diff mode to localStorage:', error)
    }
  }, [mode])

  const setMode = (newMode: DiffMode) => {
    setModeState(newMode)
  }

  const toggleMode = () => {
    setModeState((current) => (current === 'traditional' ? 'structural' : 'traditional'))
  }

  return (
    <DiffModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </DiffModeContext.Provider>
  )
}

/**
 * Hook to access diff mode context
 */
export function useDiffMode() {
  const context = useContext(DiffModeContext)
  if (!context) {
    throw new Error('useDiffMode must be used within a DiffModeProvider')
  }
  return context
}
