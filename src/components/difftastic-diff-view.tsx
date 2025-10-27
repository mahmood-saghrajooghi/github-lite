import { useMemo } from 'react'
import type {
  DifftasticNormalizedDiff,
  DifftasticNormalizedLine,
  DifftasticChange,
  DifftasticHighlight,
} from '@/types/difftastic'
import { cn } from '@/lib/utils'

interface DifftasticDiffViewProps {
  diff: DifftasticNormalizedDiff
  className?: string
}

/**
 * Get CSS class for syntax highlighting type
 */
function getHighlightClass(highlight: DifftasticHighlight): string {
  switch (highlight) {
    case 'keyword':
      return 'text-purple-600 dark:text-purple-400 font-semibold'
    case 'string':
      return 'text-green-600 dark:text-green-400'
    case 'type':
      return 'text-blue-600 dark:text-blue-400'
    case 'comment':
      return 'text-gray-500 dark:text-gray-400 italic'
    case 'delimiter':
      return 'text-gray-700 dark:text-gray-300'
    default:
      return 'text-gray-900 dark:text-gray-100'
  }
}

/**
 * Render a line with syntax highlighting
 */
function renderLineWithHighlights(
  content: string | undefined,
  changes: DifftasticChange[] | undefined
): React.ReactNode {
  if (!content || !changes || changes.length === 0) {
    return <span className="text-gray-400">{content || ''}</span>
  }

  return (
    <>
      {changes.map((change, idx) => (
        <span key={idx} className={getHighlightClass(change.highlight)}>
          {change.content}
        </span>
      ))}
    </>
  )
}

/**
 * Render a single line in the diff
 */
function DiffLine({ line }: { line: DifftasticNormalizedLine }) {
  const bgClass = useMemo(() => {
    switch (line.type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-950/30'
      case 'removed':
        return 'bg-red-50 dark:bg-red-950/30'
      case 'modified':
        return 'bg-yellow-50 dark:bg-yellow-950/30'
      default:
        return ''
    }
  }, [line.type])

  const lineMarker = useMemo(() => {
    switch (line.type) {
      case 'added':
        return '+'
      case 'removed':
        return '-'
      case 'modified':
        return '~'
      default:
        return ' '
    }
  }, [line.type])

  const markerColor = useMemo(() => {
    switch (line.type) {
      case 'added':
        return 'text-green-600 dark:text-green-400'
      case 'removed':
        return 'text-red-600 dark:text-red-400'
      case 'modified':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }, [line.type])

  return (
    <tr className={cn('hover:bg-muted/30', bgClass)}>
      {/* Left side (old) */}
      <td className="w-10 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r border-input">
        {line.oldLineNumber}
      </td>
      <td className="px-2 py-0.5 text-xs font-mono whitespace-pre border-r border-input">
        {line.type === 'added' ? (
          <span className="text-gray-400"></span>
        ) : (
          renderLineWithHighlights(line.oldContent, line.oldChanges)
        )}
      </td>

      {/* Right side (new) */}
      <td className="w-10 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r border-input">
        {line.newLineNumber}
      </td>
      <td className="w-4 px-1 text-center text-xs font-bold select-none border-r border-input">
        <span className={markerColor}>{lineMarker}</span>
      </td>
      <td className="px-2 py-0.5 text-xs font-mono whitespace-pre">
        {line.type === 'removed' ? (
          <span className="text-gray-400"></span>
        ) : (
          renderLineWithHighlights(line.newContent, line.newChanges)
        )}
      </td>
    </tr>
  )
}

/**
 * Render stats summary
 */
function DiffStats({ diff }: { diff: DifftasticNormalizedDiff }) {
  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0
    let modifications = 0

    for (const line of diff.lines) {
      if (line.type === 'added') additions++
      else if (line.type === 'removed') deletions++
      else if (line.type === 'modified') modifications++
    }

    return { additions, deletions, modifications }
  }, [diff.lines])

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className="text-green-600 dark:text-green-400">+{stats.additions}</span>
        <span>additions</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="text-red-600 dark:text-red-400">-{stats.deletions}</span>
        <span>deletions</span>
      </span>
      {stats.modifications > 0 && (
        <span className="flex items-center gap-1">
          <span className="text-yellow-600 dark:text-yellow-400">~{stats.modifications}</span>
          <span>modifications</span>
        </span>
      )}
      <span className="ml-auto text-xs font-mono text-muted-foreground">
        {diff.language}
      </span>
    </div>
  )
}

/**
 * Main difftastic diff view component
 * Renders a syntax-aware diff with structural highlighting
 */
export function DifftasticDiffView({ diff, className }: DifftasticDiffViewProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Stats header */}
      <div className="px-4 py-2 border-b border-input bg-muted/30">
        <DiffStats diff={diff} />
      </div>

      {/* Diff content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <colgroup>
            <col className="w-10" />
            <col className="w-1/2" />
            <col className="w-10" />
            <col className="w-4" />
            <col className="w-1/2" />
          </colgroup>
          <thead className="sr-only">
            <tr>
              <th>Old Line</th>
              <th>Old Content</th>
              <th>New Line</th>
              <th>Change</th>
              <th>New Content</th>
            </tr>
          </thead>
          <tbody>
            {diff.lines.map((line, index) => (
              <DiffLine key={index} line={line} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
