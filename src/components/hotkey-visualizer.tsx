import { useHotkey } from '../contexts/hotkey-context'
import { Badge } from './ui/badge'
import { Kbd } from './ui/kbd'

export function HotkeyVisualizer() {
  const {
    isVisualizerOpen,
    sequenceTrackerState,
    getAvailableHotkeys,
  } = useHotkey()

  if (!isVisualizerOpen) {
    return null
  }

  const availableHotkeys = getAvailableHotkeys()
  const currentSequence = sequenceTrackerState.join(' ')

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
      <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg p-3 w-64">
        {/* Current Sequence */}
        {currentSequence && (
          <div className="mb-2">
            <div className="flex flex-wrap items-center gap-1">
              {sequenceTrackerState.map((key, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs font-mono"
                >
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Hotkeys */}
        {availableHotkeys.length > 0 && (
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {availableHotkeys.slice(0, 6).map((hotkey) => (
              <div
                key={hotkey.key}
                className="flex items-center gap-2 text-xs"
              >
                <Kbd className="text-xs font-mono shrink-0">
                  {hotkey.key}
                </Kbd>
                {hotkey.description && (
                  <span className="text-muted-foreground truncate">
                    {hotkey.description}
                  </span>
                )}
              </div>
            ))}
            {availableHotkeys.length > 6 && (
              <div className="text-xs text-muted-foreground italic">
                +{availableHotkeys.length - 6} more
              </div>
            )}
          </div>
        )}

        {/* Minimal help */}
        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Kbd>?</Kbd> toggle
          </div>
        </div>
      </div>
    </div>
  )
}
