import type {
  DifftasticRawOutput,
  DifftasticNormalizedDiff,
  DifftasticNormalizedLine,
  DifftasticLinePair,
  DifftasticChangeType,
} from '../types/difftastic'

/**
 * Transform difftastic raw JSON output to a normalized format for rendering
 */
export function transformDifftasticOutput(
  raw: DifftasticRawOutput,
  oldPath: string,
  newPath: string
): DifftasticNormalizedDiff {
  const lines: DifftasticNormalizedLine[] = []

  // Process each chunk
  for (const chunk of raw.chunks) {
    // Process each line pair in the chunk
    for (const linePair of chunk) {
      const normalizedLine = normalizeLinePair(linePair)
      lines.push(normalizedLine)
    }
  }

  return {
    oldPath,
    newPath,
    language: raw.language,
    status: raw.status,
    lines,
  }
}

/**
 * Normalize a single line pair into a renderable format
 */
function normalizeLinePair(linePair: DifftasticLinePair): DifftasticNormalizedLine {
  const { lhs, rhs } = linePair

  // Determine the change type
  let type: DifftasticChangeType
  if (!lhs && rhs) {
    type = 'added'
  } else if (lhs && !rhs) {
    type = 'removed'
  } else if (lhs && rhs) {
    type = 'modified'
  } else {
    type = 'unchanged'
  }

  // Extract content from changes
  const oldContent = lhs ? extractContentFromChanges(lhs.changes) : undefined
  const newContent = rhs ? extractContentFromChanges(rhs.changes) : undefined

  return {
    type,
    oldLineNumber: lhs ? lhs.line_number + 1 : undefined, // Convert to 1-indexed
    newLineNumber: rhs ? rhs.line_number + 1 : undefined, // Convert to 1-indexed
    oldContent,
    newContent,
    oldChanges: lhs?.changes,
    newChanges: rhs?.changes,
  }
}

/**
 * Extract full line content from changes array
 */
function extractContentFromChanges(changes: Array<{ content: string }>): string {
  return changes.map((change) => change.content).join('')
}

/**
 * Convert difftastic output to a format compatible with react-diff-view
 * This allows us to use the existing diff rendering infrastructure
 */
interface HunkChange {
  type: 'insert' | 'delete' | 'normal'
  content: string
  lineNumber?: number
  oldLineNumber?: number
  newLineNumber?: number
}

interface Hunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  changes: HunkChange[]
}

export function transformToReactDiffView(normalized: DifftasticNormalizedDiff) {
  // Create a unified diff-like structure
  const hunks: Hunk[] = []
  let currentHunk: Hunk | null = null

  for (let i = 0; i < normalized.lines.length; i++) {
    const line = normalized.lines[i]

    // Start a new hunk if needed
    if (!currentHunk) {
      currentHunk = {
        oldStart: line.oldLineNumber || 1,
        oldLines: 0,
        newStart: line.newLineNumber || 1,
        newLines: 0,
        changes: [],
      }
    }

    // Add the change to the current hunk
    if (line.type === 'added') {
      currentHunk.changes.push({
        type: 'insert',
        content: line.newContent || '',
        lineNumber: line.newLineNumber,
        oldLineNumber: undefined,
        newLineNumber: line.newLineNumber,
      })
      currentHunk.newLines++
    } else if (line.type === 'removed') {
      currentHunk.changes.push({
        type: 'delete',
        content: line.oldContent || '',
        lineNumber: line.oldLineNumber,
        oldLineNumber: line.oldLineNumber,
        newLineNumber: undefined,
      })
      currentHunk.oldLines++
    } else if (line.type === 'modified') {
      // For modified lines, add both delete and insert
      currentHunk.changes.push({
        type: 'delete',
        content: line.oldContent || '',
        lineNumber: line.oldLineNumber,
        oldLineNumber: line.oldLineNumber,
        newLineNumber: undefined,
      })
      currentHunk.changes.push({
        type: 'insert',
        content: line.newContent || '',
        lineNumber: line.newLineNumber,
        oldLineNumber: undefined,
        newLineNumber: line.newLineNumber,
      })
      currentHunk.oldLines++
      currentHunk.newLines++
    } else {
      // unchanged
      currentHunk.changes.push({
        type: 'normal',
        content: line.oldContent || line.newContent || '',
        lineNumber: line.oldLineNumber || line.newLineNumber,
        oldLineNumber: line.oldLineNumber,
        newLineNumber: line.newLineNumber,
      })
      currentHunk.oldLines++
      currentHunk.newLines++
    }

    // Check if we should close the current hunk
    // (for now, just keep all changes in one hunk per chunk)
  }

  if (currentHunk) {
    hunks.push(currentHunk)
  }

  return {
    oldPath: normalized.oldPath,
    newPath: normalized.newPath,
    oldRevision: 'old',
    newRevision: 'new',
    type: 'modify' as const,
    hunks,
  }
}

/**
 * Calculate diff statistics
 */
export function calculateDiffStats(normalized: DifftasticNormalizedDiff) {
  let additions = 0
  let deletions = 0
  let modifications = 0

  for (const line of normalized.lines) {
    if (line.type === 'added') {
      additions++
    } else if (line.type === 'removed') {
      deletions++
    } else if (line.type === 'modified') {
      modifications++
    }
  }

  return {
    additions,
    deletions,
    modifications,
    total: additions + deletions + modifications,
  }
}
