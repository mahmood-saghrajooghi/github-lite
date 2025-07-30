import { useHotkey } from '../contexts/hotkey-context'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Kbd } from './ui/kbd'

export function HotkeyReference() {
  const { isReferenceOpen, getAllHotkeys } = useHotkey()

  if (!isReferenceOpen) {
    return null
  }

  const allHotkeys = getAllHotkeys()

  // Group hotkeys by their first key for better organization
  const groupedHotkeys = allHotkeys.reduce((groups, hotkey) => {
    const firstKey = hotkey.sequence.split(' ')[0] || 'other'
    if (!groups[firstKey]) {
      groups[firstKey] = []
    }
    groups[firstKey].push(hotkey)
    return groups
  }, {} as Record<string, Array<{ sequence: string; description?: string }>>)

  const sortedGroups = Object.entries(groupedHotkeys).sort(([a], [b]) => {
    // Sort single characters first, then by alphabetical order
    if (a.length === 1 && b.length === 1) {
      return a.localeCompare(b)
    }
    if (a.length === 1) return -1
    if (b.length === 1) return 1
    return a.localeCompare(b)
  })

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Reference Card */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <Card className="w-96 bg-background/95 backdrop-blur border shadow-lg max-h-[calc(100vh-2rem)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Hotkey Reference
              <Badge variant="secondary" className="text-xs">
                Press Shift+? to toggle
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="space-y-4">
                {sortedGroups.length > 0 ? (
                  sortedGroups.map(([groupKey, hotkeys], groupIndex) => (
                    <div key={groupKey}>
                      {/* Group Header */}
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {groupKey === 'other' ? 'Other' : `${groupKey.toUpperCase()} Commands`}
                        </h4>
                      </div>

                      {/* Hotkeys in group */}
                      <div className="space-y-1 mb-3">
                        {hotkeys.map((hotkey, index) => (
                          <div
                            key={`${hotkey.sequence}-${index}`}
                            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                          >
                            {/* Hotkey sequence */}
                            <div className="flex items-center gap-1 shrink-0">
                              {hotkey.sequence.split(' ').map((key, keyIndex) => (
                                <Kbd
                                  key={keyIndex}
                                  className="text-xs font-mono"
                                >
                                  {key}
                                </Kbd>
                              ))}
                            </div>

                            {/* Description */}
                            <div className="flex-1 min-w-0">
                              {hotkey.description ? (
                                <span className="text-xs text-foreground">
                                  {hotkey.description}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  No description
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Separator between groups (except last) */}
                      {groupIndex < sortedGroups.length - 1 && <Separator />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="text-xs text-muted-foreground italic">
                      No hotkeys registered
                    </span>
                  </div>
                )}

                {/* Help Text */}
                <div className="pt-4 border-t mt-4">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Press <code className="bg-muted px-1 rounded">?</code> for interactive guide</div>
                    <div>• Press <code className="bg-muted px-1 rounded">Shift+?</code> to toggle this reference</div>
                    <div>• Press <code className="bg-muted px-1 rounded">Esc</code> to close</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
