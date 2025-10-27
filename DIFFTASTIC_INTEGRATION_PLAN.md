# Difftastic Integration Plan

## Overview
Integrate the Rust-based difftastic tool into github-lite to provide structural, syntax-aware diffs. The goal is to get the AST/tree structure from difftastic and render it in the browser.

## Implementation Progress

**Plan Status**: 🟢 Phase 3 Complete - Ready for Phase 4

**Last Updated**: October 6, 2025

### ✅ Completed: Phase 1 - Backend Infrastructure

**What's Implemented:**
- ✅ Express API server with TypeScript (`api/server.ts`)
- ✅ Difftastic API endpoint (`api/routes/difftastic.ts`)
  - `POST /api/difftastic` - Process diffs with difftastic binary
  - `GET /api/difftastic/status` - Check difftastic installation
  - `GET /health` - Health check endpoint
- ✅ TypeScript type definitions (`src/types/difftastic.ts`)
- ✅ Backend TypeScript configuration (`tsconfig.api.json`)
- ✅ Package.json scripts for concurrent frontend/backend dev
- ✅ Complete setup documentation (`DIFFTASTIC_SETUP.md`)
- ✅ Test script (`test-difftastic.sh`)
- ✅ Updated README with project overview

**Dependencies Added:**
- express ^4.21.2
- cors ^2.8.5
- tsx ^4.19.2
- concurrently ^9.1.2
- @types/express ^5.0.0
- @types/cors ^2.8.17

**How to Start:**
```bash
# Install dependencies
pnpm install

# Install difftastic binary
cargo install difftastic
# or: brew install difftastic

# Start both frontend + backend
pnpm dev

# Test the setup
./test-difftastic.sh
```

**API Endpoints Available:**
- `http://localhost:3001/health` - Health check
- `http://localhost:3001/api/difftastic/status` - Check difftastic installation
- `http://localhost:3001/api/difftastic` - Process diffs (POST)

### 🔄 In Progress: None

### ✅ Completed: Phase 3 - Rendering Layer

**What's Implemented:**
- ✅ Diff Mode Context (`src/contexts/diff-mode-context.tsx`)
  - Global state management for diff mode preference (traditional vs structural)
  - Persists user choice to localStorage
  - `useDiffMode()` hook for accessing mode and toggle function
- ✅ Difftastic Diff View Component (`src/components/difftastic-diff-view.tsx`)
  - Syntax-aware rendering with structural highlighting
  - Visual indicators for added/removed/modified/unchanged lines
  - Character-level change highlighting with syntax types (keyword, string, type, etc.)
  - Side-by-side split view
  - Diff statistics display (additions, deletions, modifications)
- ✅ Updated File Changes Component (`src/routes/$owner/$repo/pulls/$number/_header/file-changes.tsx`)
  - Toggle button to switch between "Traditional" and "Structural" diff modes
  - Fetches file contents from GitHub raw API for structural diff processing
  - Conditionally renders DifftasticDiffView or traditional react-diff-view
  - Error handling with fallback to traditional diff
  - Maintains existing commenting functionality in traditional mode
- ✅ Added DiffModeProvider to root route (`src/routes/__root.tsx`)

**Status**: ✅ **COMPLETED** - Ready for Phase 4

### ✅ Completed: Phase 2 - Data Transformation Layer

**What's Implemented:**
- ✅ Enhanced TypeScript type definitions with actual difftastic JSON output structure
- ✅ Difftastic API client (`src/lib/difftastic-client.ts`)
  - `processDiff()` - Send diff requests to backend API
  - `checkDifftasticStatus()` - Check difftastic installation status
  - `processGitHubFileDiff()` - Convenience wrapper for GitHub files
- ✅ Data transformer (`src/lib/difftastic-transformer.ts`)
  - `transformDifftasticOutput()` - Convert raw JSON to normalized format
  - `transformToReactDiffView()` - Convert to react-diff-view compatible format
  - `calculateDiffStats()` - Calculate additions/deletions/modifications
- ✅ React Query hook (`src/hooks/api/use-difftastic-diff.ts`)
  - `useDifftasticDiff()` - Fetch and transform diffs with caching
  - `useDifftasticStatus()` - Check backend status
- ✅ Updated API route to use `DFT_UNSTABLE=yes` environment variable

**Status**: ✅ **COMPLETED** - Ready for Phase 3

### ⏳ Pending: Phases 4-5

**Next Phase: Phase 4 - Integration with Existing Flow** (see details below)

## Current State Analysis

### Existing Implementation
- **Diff Library**: `react-diff-view` for rendering unified/split diffs
- **Syntax Highlighting**: `refractor` for code tokenization
- **Processing**: Service worker (`diff-worker.ts`) handles diff parsing and tokenization
- **Rendering**: `file-changes.tsx` displays side-by-side diffs with commenting support

### Current Flow
1. Fetch PR diff from GitHub API (unified diff format)
2. Parse with `parseDiff()` from react-diff-view
3. Tokenize hunks with `refractor` in service worker
4. Render with `react-diff-view` components

## Proposed Architecture

### Option 1: Server-Side Difftastic (Recommended)
**Approach**: Run difftastic on a Node.js backend/API endpoint

**Pros**:
- Full control over difftastic execution
- Can handle large diffs without browser limitations
- Better error handling
- Supports streaming/chunked responses

**Cons**:
- Requires backend infrastructure
- Additional deployment complexity

**Implementation**:
1. Create API endpoint (e.g., `/api/diff`) that:
   - Accepts two file contents or GitHub PR info
   - Runs difftastic binary with JSON output flag
   - Returns structured diff data
2. Parse difftastic JSON output
3. Transform to renderable format
4. Send to frontend

### Option 2: WASM Compilation (Advanced)
**Approach**: Compile difftastic to WebAssembly

**Pros**:
- Runs entirely in browser
- No backend needed
- Fits current service worker architecture

**Cons**:
- Complex compilation process
- Difftastic may not easily compile to WASM (tree-sitter dependencies)
- Large WASM bundle size
- Memory limitations in browser

### Option 3: Hybrid Approach (Fallback Strategy)
**Approach**: Use difftastic when available, fallback to current implementation

**Pros**:
- Progressive enhancement
- Works everywhere
- Best of both worlds

**Cons**:
- Two codepaths to maintain

## Recommended Implementation Plan

### Phase 1: Setup Backend Infrastructure ✅ COMPLETE
**Goal**: Create Node.js service to run difftastic

**Status**: ✅ **COMPLETED**

**Implemented Files:**
- `api/server.ts` - Express server running on port 3001
- `api/routes/difftastic.ts` - Difftastic API routes with error handling
- `tsconfig.api.json` - Backend TypeScript configuration
- `src/types/difftastic.ts` - Type definitions for API requests/responses
- `DIFFTASTIC_SETUP.md` - Complete setup guide with troubleshooting
- `test-difftastic.sh` - Automated test script
- Updated `package.json` with backend scripts and dependencies
- Updated `README.md` with project overview
- Updated `.gitignore` for temp files

**Tasks Completed**:
1. ✅ **Install Difftastic Binary**
   - Documented installation via cargo and homebrew
   - Added installation instructions to DIFFTASTIC_SETUP.md
   - Created test script to verify installation

2. ✅ **Create API Endpoint** (`api/routes/difftastic.ts`)
   - Express endpoint that accepts:
     - `oldContent`: string (file before)
     - `newContent`: string (file after)
     - `language`: string (optional, auto-detect)
     - `oldPath`: string (file path for extension detection)
     - `newPath`: string (file path for extension detection)
   - Spawns difftastic child process with `child_process.exec`
   - Parses JSON output from `--display json` flag
   - Returns structured data or raw output as fallback
   - Includes comprehensive error handling
   - Cleans up temporary files after processing

3. ✅ **Difftastic JSON Output**
   - Uses `--display json` flag for structured output
   - Command: `difft --display json --language <lang> <oldFile> <newFile>`
   - Sets `DFT_PARSE_ERROR_LIMIT=20` for tolerance
   - Parses JSON structure (structure depends on difftastic version)
   - Falls back to raw output if JSON parsing fails

**API Endpoints:**
- `POST /api/difftastic` - Process diffs
- `GET /api/difftastic/status` - Check installation
- `GET /health` - Health check

**How to Use:**
```bash
# Start the API server
pnpm dev:api

# Or start both frontend + backend
pnpm dev

# Test it
./test-difftastic.sh
```

### Phase 2: Data Transformation Layer ✅ COMPLETE
**Goal**: Convert difftastic output to renderable format

**Status**: ✅ **COMPLETED**

**Prerequisites**: ✅ Phase 1 complete

**Tasks**:
1. ✅ **Enhance Type Definitions** (`src/types/difftastic.ts`)
   - ✅ Investigated actual difftastic JSON output format
   - ✅ Added detailed types for difftastic JSON output structure
   - Implemented types:
     - `DifftasticRawOutput` - Raw JSON from difftastic binary
     - `DifftasticLinePair` - Side-by-side line comparison
     - `DifftasticChange` - Character-level changes with highlighting
     - `DifftasticNormalizedLine` - Normalized format for rendering
     - `DifftasticNormalizedDiff` - Final transformed output

2. ✅ **Create Transformer** (`src/lib/difftastic-transformer.ts`)
   - ✅ `transformDifftasticOutput()` - Convert raw JSON to normalized format
   - ✅ `transformToReactDiffView()` - Convert to react-diff-view compatible format
   - ✅ `calculateDiffStats()` - Calculate diff statistics
   - ✅ Line-based structure maintained for commenting support
   - ✅ Syntax nodes mapped to line numbers

3. ✅ **Create API Client** (`src/lib/difftastic-client.ts`)
   - ✅ `processDiff()` - Fetch wrapper for difftastic API
   - ✅ `checkDifftasticStatus()` - Check backend availability
   - ✅ `processGitHubFileDiff()` - Convenience wrapper for GitHub files
   - ✅ Error handling included
   - ✅ Type-safe request/response handling

4. ✅ **Create React Query Hook** (`src/hooks/api/use-difftastic-diff.ts`)
   - ✅ `useDifftasticDiff()` - Hook with caching and error handling
   - ✅ `useDifftasticStatus()` - Check difftastic availability
   - ✅ Automatic retries and stale-while-revalidate caching

**Implementation Notes:**
- Discovered difftastic requires `DFT_UNSTABLE=yes` environment variable for JSON output
- Difftastic auto-detects language from file extension (no `--language` flag needed)
- JSON format uses line-based chunks with character-level granularity
- Output includes syntax highlighting hints (keyword, string, type, delimiter, etc.)

### Phase 3: Rendering Layer ✅ COMPLETE
**Goal**: Display difftastic output with syntax-aware highlighting

**Status**: ✅ **COMPLETED**

**Prerequisites**: ✅ Phase 1 complete, ✅ Phase 2 complete

**Tasks**:
1. ✅ **New Diff Renderer Component** (`src/components/difftastic-diff-view.tsx`)
   - ✅ Component to render syntax tree with structural highlighting
   - ✅ Visual indicators for:
     - Added lines (green background)
     - Removed lines (red background)
     - Modified lines (yellow background)
     - Unchanged lines
   - ✅ Support for:
     - Side-by-side split view
     - Syntax highlighting based on node type (keyword, string, type, delimiter, comment)
     - Character-level change visualization
     - Diff statistics display

2. ✅ **Update File Changes Component** (`src/routes/$owner/$repo/pulls/$number/_header/file-changes.tsx`)
   - ✅ Added toggle button: "Structural" vs "Traditional"
   - ✅ Use difftastic for structural view
   - ✅ Keep react-diff-view for traditional view
   - ✅ Fetch file contents from GitHub for structural diff
   - ✅ Maintain existing commenting functionality (in traditional mode)
   - ✅ Error handling with fallback to traditional diff

3. ✅ **Create Diff Mode Context** (`src/contexts/diff-mode-context.tsx`)
   - ✅ Global state for diff mode preference
   - ✅ Persist user choice to localStorage
   - ✅ `useDiffMode()` hook with `mode`, `setMode()`, and `toggleMode()`

**Implementation Notes:**
- Toggle button placed in file header for easy access
- File contents fetched dynamically from GitHub raw API
- Structural diff only loads when mode is active (performance optimization)
- Graceful fallback to traditional diff on errors
- Commenting features currently only available in traditional mode

### Phase 4: Integration with Existing Flow ⏳ TODO
**Goal**: Connect difftastic to GitHub PR workflow

**Status**: ⏳ **NOT STARTED**

**Prerequisites**: ✅ Phase 1 complete, ✅ Phase 2 complete, ✅ Phase 3 complete

**Tasks**:
1. **Update PR Diff Query Hook** (`src/hooks/api/use-pr-diff-query.ts`)
   - Add parameter for diff mode
   - Fetch from difftastic API when in structural mode
   - Keep existing logic for traditional mode

2. **Create Difftastic Worker** (`src/difftastic-worker.ts`)
   - Service worker for difftastic processing
   - Cache difftastic results
   - Handle offline scenarios

3. **Update Comment Positioning**
   - Map difftastic node positions to GitHub line numbers
   - Ensure comments appear on correct lines
   - Handle syntax node boundaries

### Phase 5: UI/UX Enhancements ⏳ TODO
**Goal**: Make structural diffs intuitive and useful

**Status**: ⏳ **NOT STARTED**

**Prerequisites**: ✅ Phase 1 complete, ✅ Phase 2 complete, ✅ Phase 3 complete, ⏳ Phase 4 required

**Tasks**:
1. **Visual Design**
   - Color scheme for different node types
   - Indentation to show tree structure
   - Icons for node types (function, class, etc.)
   - Smooth expand/collapse animations

2. **Keyboard Navigation**
   - Jump to next/previous change
   - Expand/collapse nodes
   - Navigate by syntax level

3. **Settings Panel**
   - Toggle between diff modes
   - Adjust diff sensitivity
   - Configure syntax highlighting

4. **Performance Optimizations**
   - Virtual scrolling for large diffs
   - Lazy loading of unchanged nodes
   - Debounce API calls

## Technical Specifications

### Backend Service Structure
```
/
├── api/
│   ├── server.ts              # Express/Fastify server
│   └── routes/
│       └── difftastic.ts      # Difftastic endpoint
├── bin/
│   └── difft                  # Difftastic binary (per platform)
└── package.json               # Add backend scripts
```

### API Endpoint Specification
```typescript
POST /api/difftastic

Request Body:
{
  oldContent: string
  newContent: string
  oldPath: string
  newPath: string
  language?: string
}

Response:
{
  success: boolean
  diff: DifftasticDiff
  error?: string
}
```

### Difftastic Command
```bash
# Get JSON output
difft --display json --language typescript old.ts new.ts

# With parse error tolerance
DFT_PARSE_ERROR_LIMIT=20 difft --display json old.ts new.ts
```

## Dependencies to Add

### Backend
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "@types/express": "^4.17.17",
  "@types/cors": "^2.8.13"
}
```

### Build Tools
- Add binary copying script for difftastic
- Platform-specific binary detection (macOS/Linux/Windows)

## File Structure Changes

### New Files
```
src/
├── api/                       # Backend API
│   ├── server.ts
│   └── routes/
│       └── difftastic.ts
├── lib/
│   ├── difftastic-client.ts   # API client
│   └── difftastic-transformer.ts # Data transformation
├── types/
│   └── difftastic.ts          # Type definitions
├── components/
│   └── difftastic-diff-view.tsx # Rendering component
├── contexts/
│   └── diff-mode-context.tsx  # Global state
├── hooks/api/
│   └── use-difftastic-diff.ts # React Query hook
└── difftastic-worker.ts       # Service worker extension
```

### Modified Files
```
src/
├── routes/$owner/$repo/pulls/$number/_header/
│   └── file-changes.tsx       # Add difftastic toggle
└── hooks/api/
    └── use-pr-diff-query.ts   # Add difftastic support
```

## Testing Strategy

### Unit Tests
- Test difftastic transformer functions
- Test API client error handling
- Test component rendering

### Integration Tests
- Test full flow: API → Transform → Render
- Test fallback to traditional diff
- Test comment positioning

### Manual Testing
- Test with various languages
- Test with large diffs
- Test with parse errors
- Test offline behavior

## Rollout Strategy

### Development Phase
1. Create feature branch
2. Implement backend API
3. Implement transformer
4. Create basic renderer
5. Add toggle to existing UI

### Beta Testing
1. Deploy to staging environment
2. Enable for specific test users
3. Collect feedback on UX
4. Monitor performance metrics

### Production Rollout
1. Launch with feature flag (default OFF)
2. Gradually enable for users
3. Monitor error rates
4. Gather usage analytics
5. Make default after stable period

## Success Metrics

### Performance
- Diff processing time < 2s for typical files
- UI remains responsive during rendering
- Memory usage stays reasonable

### User Experience
- Users can understand structural changes better
- Reduced time to review PRs
- Positive feedback on new diff view

### Technical
- Error rate < 1%
- Fallback working correctly
- No degradation in existing features

## Risks and Mitigations

### Risk: Difftastic Binary Size
- **Impact**: Large deployment artifacts
- **Mitigation**: Download binary on-demand, use CDN

### Risk: Parse Errors
- **Impact**: Diff fails to generate
- **Mitigation**: Fallback to traditional diff, adjust error limit

### Risk: Performance Issues
- **Impact**: Slow diff processing
- **Mitigation**: Implement caching, show loading states, use worker threads

### Risk: Incompatible with Comments
- **Impact**: Can't comment on specific lines
- **Mitigation**: Maintain mapping between syntax nodes and line numbers

### Risk: Backend Dependency
- **Impact**: Requires infrastructure
- **Mitigation**: Consider WASM in future, use serverless functions

## Alternative Approaches Considered

### Tree-sitter Direct Integration
- Use tree-sitter directly in JS
- **Rejected**: Difftastic provides more than just parsing

### Client-side Binary Execution
- Use Node.js in Electron-like wrapper
- **Rejected**: Not suitable for web app

### Pre-computed Diffs
- Compute diffs during PR creation
- **Rejected**: GitHub doesn't provide this

## Open Questions

1. **How to handle very large files?**
   - Option A: Chunk processing
   - Option B: Diff size limit
   - Option C: Progressive rendering

2. **Should we support inline view or just split?**
   - Difftastic works best with split view
   - Consider offering both

3. **How to handle multi-file refactors?**
   - Cross-file change detection
   - Show related changes together

4. **Deployment strategy for binary?**
   - Package with app?
   - Download on first use?
   - Use system binary?

## Timeline Estimate

- **Phase 1**: 3-5 days
- **Phase 2**: 2-3 days
- **Phase 3**: 5-7 days
- **Phase 4**: 3-4 days
- **Phase 5**: 4-5 days

**Total**: 17-24 days

## Next Steps for Continuation

### Immediate Next Steps (Phase 2)

1. **Understand Difftastic JSON Output Format**
   ```bash
   # Test difftastic JSON output manually
   cd /tmp
   echo 'function hello() { console.log("Hello"); }' > old.ts
   echo 'function hello() { console.log("Hello, World!"); }' > new.ts
   difft --display json --language typescript old.ts new.ts > output.json
   cat output.json | jq .  # Pretty print the JSON
   ```

2. **Create API Client** (`src/lib/difftastic-client.ts`)
   - Fetch wrapper for `http://localhost:3001/api/difftastic`
   - Use TypeScript types from `src/types/difftastic.ts`
   - Add error handling

3. **Create Transformer** (`src/lib/difftastic-transformer.ts`)
   - Parse difftastic JSON output
   - Convert to renderable format
   - Map to line numbers for commenting support

4. **Create React Query Hook** (`src/hooks/api/use-difftastic-diff.ts`)
   - Hook that uses the API client
   - Caching with React Query
   - Loading and error states

### Files to Create Next (Phase 2)

```
src/
├── lib/
│   ├── difftastic-client.ts      # ← Start here
│   └── difftastic-transformer.ts # ← Then this
└── hooks/api/
    └── use-difftastic-diff.ts    # ← Finally this
```

### Testing the Current Implementation

Before continuing, verify Phase 1 works:

```bash
# 1. Install dependencies
pnpm install

# 2. Install difftastic
cargo install difftastic
# or: brew install difftastic

# 3. Start the API server
pnpm dev:api

# 4. In another terminal, run the test script
./test-difftastic.sh

# 5. Manual API test
curl -X POST http://localhost:3001/api/difftastic \
  -H "Content-Type: application/json" \
  -d '{
    "oldContent": "function test() { return 1; }",
    "newContent": "function test() { return 2; }",
    "oldPath": "test.ts",
    "newPath": "test.ts"
  }'
```

### Documentation for Next Developer

**Current State:**
- ✅ Backend API is fully functional
- ✅ API can process diffs via difftastic binary
- ✅ Type definitions exist for API layer
- ⏳ No frontend integration yet
- ⏳ No data transformation layer yet

**What's Working:**
- Express server on `http://localhost:3001`
- POST `/api/difftastic` accepts file contents and returns difftastic output
- GET `/api/difftastic/status` checks if difftastic is installed
- Concurrent dev mode with `pnpm dev` (runs both Vite + Express)

**What Needs Work:**
- Phase 4: Integration with existing GitHub PR workflow (comments in structural mode, worker optimization)
- Phase 5: UI/UX polish (collapsible nodes, keyboard navigation, performance optimizations)

**Key Files to Review:**
- `DIFFTASTIC_SETUP.md` - Complete setup instructions
- `api/routes/difftastic.ts` - API implementation
- `src/types/difftastic.ts` - Type definitions
- `src/routes/$owner/$repo/pulls/$number/_header/file-changes.tsx` - Current diff UI (needs integration)

---

**Plan Status**: 🟢 Phase 3 Complete - Ready for Phase 4

**Created**: October 6, 2025
**Phase 1 Completed**: October 6, 2025
**Phase 2 Completed**: October 6, 2025
**Phase 3 Completed**: October 6, 2025
**Author**: AI Assistant
