/**
 * Type definitions for Difftastic integration
 * Based on difftastic JSON output format (DFT_UNSTABLE=yes)
 */

/**
 * Highlight types returned by difftastic
 */
export type DifftasticHighlight = 'normal' | 'keyword' | 'string' | 'type' | 'delimiter' | 'comment'

/**
 * File status returned by difftastic
 */
export type DifftasticFileStatus = 'changed' | 'unchanged' | 'added' | 'removed'

/**
 * A change within a line (character-level granularity)
 */
export interface DifftasticChange {
  /** Starting position in the line (0-indexed) */
  start: number
  /** Ending position in the line (0-indexed) */
  end: number
  /** The text content of this change */
  content: string
  /** Syntax highlighting classification */
  highlight: DifftasticHighlight
}

/**
 * Side of a line comparison (left-hand or right-hand side)
 */
export interface DifftasticLineSide {
  /** Line number (0-indexed) */
  line_number: number
  /** Changes within this line */
  changes: DifftasticChange[]
}

/**
 * A pair of lines being compared (can have lhs, rhs, or both)
 */
export interface DifftasticLinePair {
  /** Left-hand side (old file), omitted if line was added */
  lhs?: DifftasticLineSide
  /** Right-hand side (new file), omitted if line was removed */
  rhs?: DifftasticLineSide
}

/**
 * A chunk of related changes (contiguous group of changed lines)
 */
export type DifftasticChunk = DifftasticLinePair[]

/**
 * Raw difftastic JSON output structure
 */
export interface DifftasticRawOutput {
  /** Chunks of changes in the file */
  chunks: DifftasticChunk[]
  /** Detected language */
  language: string
  /** Path to the file */
  path: string
  /** File status */
  status: DifftasticFileStatus
}

/**
 * Normalized position for easier use in UI
 */
export interface DifftasticPosition {
  line: number
  column: number
}

/**
 * Normalized range
 */
export interface DifftasticRange {
  start: DifftasticPosition
  end: DifftasticPosition
}

/**
 * Change type after normalization
 */
export type DifftasticChangeType = 'unchanged' | 'added' | 'removed' | 'modified'

/**
 * Normalized line for rendering (after transformation)
 */
export interface DifftasticNormalizedLine {
  /** Change type */
  type: DifftasticChangeType
  /** Line number in old file (undefined for additions) */
  oldLineNumber?: number
  /** Line number in new file (undefined for deletions) */
  newLineNumber?: number
  /** Content on the left side (old) */
  oldContent?: string
  /** Content on the right side (new) */
  newContent?: string
  /** Changes in the old content */
  oldChanges?: DifftasticChange[]
  /** Changes in the new content */
  newChanges?: DifftasticChange[]
}

/**
 * Normalized diff output for rendering
 */
export interface DifftasticNormalizedDiff {
  oldPath: string
  newPath: string
  language: string
  status: DifftasticFileStatus
  lines: DifftasticNormalizedLine[]
}

/**
 * API Request/Response types
 */
export interface DifftasticAPIRequest {
  oldContent: string
  newContent: string
  oldPath: string
  newPath: string
}

export interface DifftasticAPIResponse {
  success: boolean
  diff?: DifftasticRawOutput
  raw?: string // Raw text output if JSON parsing fails
  error?: string
}

export interface DifftasticStatusResponse {
  success: boolean
  installed: boolean
  version?: string
  error?: string
}
