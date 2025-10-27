# Phase 2 Complete: Data Transformation Layer

## Summary

Phase 2 of the Difftastic integration is now complete! This phase focused on building the data transformation layer that bridges the difftastic backend API with the frontend rendering layer.

## What Was Implemented

### 1. Enhanced Type Definitions (`src/types/difftastic.ts`)

Created comprehensive TypeScript types based on the actual difftastic JSON output format:

**Raw Output Types:**
- `DifftasticRawOutput` - The JSON structure returned by difftastic binary
- `DifftasticLinePair` - Represents a side-by-side line comparison (lhs/rhs)
- `DifftasticLineSide` - One side of a comparison (line number + changes)
- `DifftasticChange` - Character-level change with syntax highlighting
- `DifftasticHighlight` - Syntax types: `normal`, `keyword`, `string`, `type`, `delimiter`, `comment`
- `DifftasticFileStatus` - File status: `changed`, `unchanged`, `added`, `removed`

**Normalized Types:**
- `DifftasticNormalizedLine` - Easier-to-render line format
- `DifftasticNormalizedDiff` - Complete normalized diff for UI consumption
- `DifftasticChangeType` - Change types: `unchanged`, `added`, `removed`, `modified`

### 2. API Client (`src/lib/difftastic-client.ts`)

Built a type-safe API client with three main functions:

```typescript
// Process a diff between two file contents
processDiff(request: DifftasticAPIRequest): Promise<DifftasticAPIResponse>

// Check if difftastic backend is available
checkDifftasticStatus(): Promise<DifftasticStatusResponse>

// Convenience wrapper for GitHub file diffs
processGitHubFileDiff(params): Promise<DifftasticAPIResponse>
```

**Features:**
- ✅ Full TypeScript type safety
- ✅ Error handling for network failures
- ✅ Configurable API base URL via environment variable
- ✅ Clean async/await API

### 3. Data Transformer (`src/lib/difftastic-transformer.ts`)

Created transformation utilities to convert difftastic output into usable formats:

```typescript
// Convert raw difftastic output to normalized format
transformDifftasticOutput(raw, oldPath, newPath): DifftasticNormalizedDiff

// Convert to react-diff-view compatible format
transformToReactDiffView(normalized): ReactDiffViewFormat

// Calculate diff statistics
calculateDiffStats(normalized): { additions, deletions, modifications }
```

**Key Features:**
- ✅ Converts difftastic's line-pair format to normalized lines
- ✅ Determines change types (added/removed/modified)
- ✅ Preserves character-level change information
- ✅ Maps to line numbers for commenting support
- ✅ Can output react-diff-view compatible format

### 4. React Query Hook (`src/hooks/api/use-difftastic-diff.ts`)

Implemented React Query hooks for data fetching with caching:

```typescript
// Fetch and transform diffs with automatic caching
useDifftasticDiff(options: UseDifftasticDiffOptions)

// Check difftastic backend status
useDifftasticStatus()
```

**Features:**
- ✅ Automatic request caching (5 minute stale time)
- ✅ Background refetching with stale-while-revalidate
- ✅ Automatic retries (up to 2 attempts)
- ✅ Loading and error states
- ✅ Conditional fetching with `enabled` flag

### 5. Backend Updates

Updated the difftastic API route:
- ✅ Added `DFT_UNSTABLE=yes` environment variable for JSON output
- ✅ Removed invalid `--language` flag (difftastic auto-detects from file extension)
- ✅ Fixed TypeScript linter issues

## How It Works

### Data Flow

```
GitHub API → Frontend
    ↓
    1. useDifftasticDiff() hook triggered
    ↓
    2. processDiff() sends request to backend
    ↓
    3. Backend spawns difftastic process with JSON output
    ↓
    4. Raw JSON returned to frontend
    ↓
    5. transformDifftasticOutput() normalizes data
    ↓
    6. React Query caches result
    ↓
    7. Component receives normalized diff
```

### Example Usage

```typescript
import { useDifftasticDiff } from '@/hooks/api/use-difftastic-diff'

function DiffView({ oldContent, newContent, filePath }) {
  const { data, isLoading, error } = useDifftasticDiff({
    oldContent,
    newContent,
    oldPath: filePath,
    newPath: filePath,
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  if (!data) return null

  return (
    <div>
      {data.lines.map((line, i) => (
        <DiffLine key={i} line={line} />
      ))}
    </div>
  )
}
```

## Testing

Created test script: `test-phase2.sh`

Run tests:
```bash
# Start the backend API
pnpm dev:api

# In another terminal, run the test
./test-phase2.sh
```

The test verifies:
1. ✅ Difftastic backend is installed and accessible
2. ✅ API can process diffs successfully
3. ✅ Response structure matches expected format
4. ✅ Chunks, language, and status are present

## Technical Discoveries

### Difftastic JSON Format

Difftastic returns JSON in this structure:
```json
{
  "chunks": [
    [
      {
        "lhs": {
          "line_number": 0,
          "changes": [
            { "start": 0, "end": 5, "content": "Hello", "highlight": "string" }
          ]
        },
        "rhs": {
          "line_number": 0,
          "changes": [
            { "start": 0, "end": 5, "content": "Hello", "highlight": "string" },
            { "start": 6, "end": 11, "content": "World", "highlight": "string" }
          ]
        }
      }
    ]
  ],
  "language": "TypeScript",
  "path": "file.ts",
  "status": "changed"
}
```

### Key Insights

1. **DFT_UNSTABLE Required**: JSON output is an unstable feature requiring `DFT_UNSTABLE=yes`
2. **No Language Flag**: Difftastic auto-detects language from file extension
3. **Character-Level Granularity**: Changes specify exact character positions
4. **Syntax Highlighting Built-in**: Each change includes a highlight type
5. **Line-Based**: Despite being "structural", output is organized by lines

## Files Created/Modified

### New Files
- `src/types/difftastic.ts` (enhanced)
- `src/lib/difftastic-client.ts`
- `src/lib/difftastic-transformer.ts`
- `src/hooks/api/use-difftastic-diff.ts`
- `test-phase2.sh`

### Modified Files
- `api/routes/difftastic.ts` (added `DFT_UNSTABLE`, removed `--language`)
- `DIFFTASTIC_INTEGRATION_PLAN.md` (updated status)

## What's Next: Phase 3 - Rendering Layer

The next phase will focus on displaying difftastic output in the UI:

### Planned Components

1. **DifftasticDiffView Component** (`src/components/difftastic-diff-view.tsx`)
   - Render normalized diff lines
   - Syntax-aware highlighting
   - Character-level change visualization
   - Support for side-by-side and inline views

2. **Integration with file-changes.tsx**
   - Add toggle between "Traditional Diff" and "Structural Diff"
   - Integrate useDifftasticDiff hook
   - Maintain existing commenting functionality
   - Fallback to traditional diff if difftastic unavailable

3. **Diff Mode Context**
   - Global state for diff mode preference
   - Persist user choice to localStorage

### To Start Phase 3

```bash
# Review the current diff rendering component
cat src/routes/\$owner/\$repo/pulls/\$number/_header/file-changes.tsx

# Start implementing the difftastic diff view component
# based on the existing react-diff-view implementation
```

## Conclusion

Phase 2 is complete and tested! The data transformation layer is ready, providing a clean API for fetching, transforming, and caching difftastic output. The infrastructure is in place to start building the rendering layer in Phase 3.

**Status**: ✅ Phase 2 Complete
**Next**: 🚀 Phase 3 - Rendering Layer

---

**Completed**: October 6, 2025
**Author**: AI Assistant
