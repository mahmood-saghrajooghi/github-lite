# Difftastic Integration - Project Handoff

**Date**: October 6, 2025
**Status**: Phase 2 Complete ✅
**Latest Update**: Phase 2 - Data Transformation Layer (October 6, 2025)

---

## Quick Start for New Developer

### 1. Get Up and Running (5 minutes)

```bash
# Clone and install
pnpm install

# Install difftastic binary
cargo install difftastic
# or: brew install difftastic

# Start both frontend + backend
pnpm dev

# Verify everything works
./test-difftastic.sh
```

You should see:
- Frontend running on `http://localhost:5173`
- Backend API on `http://localhost:3001`
- All tests passing ✓

---

## What's Been Built (Phase 1)

### Backend API ✅
- **Express server** (`api/server.ts`) running on port 3001
- **Difftastic endpoint** (`api/routes/difftastic.ts`) that:
  - Accepts two file contents
  - Runs difftastic binary with `--display json` flag
  - Returns structured diff data
  - Handles errors gracefully
  - Cleans up temp files

### API Endpoints
- `POST /api/difftastic` - Process diffs
  - Request: `{ oldContent, newContent, oldPath, newPath, language? }`
  - Response: `{ success, diff?, raw?, error? }`
- `GET /api/difftastic/status` - Check if difftastic is installed
- `GET /health` - Health check

### TypeScript Types ✅
- `src/types/difftastic.ts` - API request/response types
- Ready for extension with actual difftastic output structure

### Documentation ✅
- `DIFFTASTIC_INTEGRATION_PLAN.md` - Complete roadmap (updated with progress)
- `DIFFTASTIC_SETUP.md` - Setup guide with troubleshooting
- `README.md` - Project overview
- `test-difftastic.sh` - Automated test script

### Dev Workflow ✅
- `pnpm dev` - Runs both frontend + backend concurrently
- `pnpm dev:vite` - Frontend only
- `pnpm dev:api` - Backend only
- Hot reload works for both

---

## What's Next (Phase 2)

### Goal
Convert difftastic's JSON output into a format we can render in React.

### Files to Create

1. **`src/lib/difftastic-client.ts`** (Start here)
   ```typescript
   // Fetch wrapper for the API
   export async function fetchDifftasticDiff(
     oldContent: string,
     newContent: string,
     oldPath: string,
     newPath: string,
     language?: string
   ): Promise<DifftasticAPIResponse>
   ```

2. **`src/lib/difftastic-transformer.ts`**
   ```typescript
   // Transform difftastic JSON to renderable format
   export function transformDifftasticToHunks(
     difftasticOutput: any
   ): /* compatible with react-diff-view */
   ```

3. **`src/hooks/api/use-difftastic-diff.ts`**
   ```typescript
   // React Query hook
   export function useDifftasticDiff(
     oldContent: string,
     newContent: string,
     oldPath: string,
     newPath: string
   )
   ```

### Before You Start Phase 2

**First, understand difftastic's JSON format:**

```bash
# Test difftastic manually
cd /tmp
echo 'function hello() { console.log("Hello"); }' > old.ts
echo 'function hello() { console.log("Hello, World!"); }' > new.ts

# Run with JSON output
difft --display json --language typescript old.ts new.ts

# Or test via our API
curl -X POST http://localhost:3001/api/difftastic \
  -H "Content-Type: application/json" \
  -d '{
    "oldContent": "function hello() { console.log(\"Hello\"); }",
    "newContent": "function hello() { console.log(\"Hello, World!\"); }",
    "oldPath": "test.ts",
    "newPath": "test.ts",
    "language": "typescript"
  }' | jq .
```

**Study the output structure**, then:
1. Update `src/types/difftastic.ts` with accurate types
2. Build the transformer
3. Create the API client
4. Create the React Query hook

---

## Project Structure

```
github-lite/
├── api/                              # ✅ Backend (Phase 1)
│   ├── server.ts                    # Express server
│   └── routes/
│       └── difftastic.ts            # Difftastic endpoint
├── src/
│   ├── types/
│   │   └── difftastic.ts            # ✅ API types (Phase 1)
│   ├── lib/                          # ⏳ Phase 2
│   │   ├── difftastic-client.ts     # TODO: API client
│   │   └── difftastic-transformer.ts # TODO: Transformer
│   ├── hooks/api/                    # ⏳ Phase 2
│   │   └── use-difftastic-diff.ts   # TODO: React Query hook
│   ├── components/                   # ⏳ Phase 3
│   │   └── difftastic-diff-view.tsx # TODO: Renderer
│   └── routes/$owner/$repo/pulls/$number/_header/
│       └── file-changes.tsx         # ⏳ Phase 4: Integrate here
└── ...
```

---

## Key Commands

```bash
# Development
pnpm dev                    # Start both servers
pnpm dev:vite              # Frontend only
pnpm dev:api               # Backend only

# Testing
./test-difftastic.sh       # Run automated tests
curl http://localhost:3001/health  # Health check

# Building
pnpm build                 # Build frontend
pnpm build:api            # Build backend

# Other
pnpm lint                  # Run linter
pnpm codegen              # Generate GraphQL types
```

---

## Important Files to Review

Before continuing, read these files:

1. **`DIFFTASTIC_INTEGRATION_PLAN.md`** - The master plan (updated with Phase 1 progress)
2. **`DIFFTASTIC_SETUP.md`** - Setup instructions and troubleshooting
3. **`api/routes/difftastic.ts`** - See how we're calling difftastic
4. **`src/types/difftastic.ts`** - Current type definitions
5. **`src/routes/$owner/$repo/pulls/$number/_header/file-changes.tsx`** - Where we'll integrate difftastic UI

---

## Architecture Decisions Made

### Why Server-Side Difftastic?
- Full control over binary execution
- No browser memory limits
- Better error handling
- Can handle large diffs

### Why Express?
- Simple, well-known
- TypeScript support
- Easy to deploy

### Why JSON Output?
- Structured data from difftastic
- Can parse and transform
- Type-safe with TypeScript

---

## Troubleshooting

### API not starting?
```bash
# Check if port 3001 is available
lsof -ti:3001 | xargs kill -9

# Try running API directly
pnpm dev:api
```

### Difftastic not found?
```bash
# Install it
cargo install difftastic
# or
brew install difftastic

# Verify
difft --version
```

### Tests failing?
```bash
# Make sure both servers are running
pnpm dev

# In another terminal
./test-difftastic.sh
```

---

## Performance Notes

- Difftastic can be slow on large files (> 2000 lines)
- Consider adding timeout to API requests
- May want to add file size limits
- Consider caching results

---

## Questions?

- See `DIFFTASTIC_INTEGRATION_PLAN.md` for the complete roadmap
- Check `DIFFTASTIC_SETUP.md` for setup help
- Read difftastic docs: https://difftastic.wilfred.me.uk/

---

## Timeline

- **Phase 1**: ✅ Complete (October 6, 2025)
- **Phase 2**: ✅ Complete (October 6, 2025)
- **Phase 3**: ⏳ TODO - Rendering Layer (Est: 5-7 days)
- **Phase 4**: ⏳ TODO - Integration (Est: 3-4 days)
- **Phase 5**: ⏳ TODO - UI/UX Polish (Est: 4-5 days)

**Total Remaining**: 12-16 days

---

## Phase 2 Update (Just Completed!)

### What Was Built

**New Files:**
- `src/lib/difftastic-client.ts` - Type-safe API client
- `src/lib/difftastic-transformer.ts` - Data transformation utilities
- `src/hooks/api/use-difftastic-diff.ts` - React Query hooks with caching
- `test-phase2.sh` - Phase 2 test script
- `PHASE2_COMPLETE.md` - Detailed documentation

**Enhanced Files:**
- `src/types/difftastic.ts` - Complete types based on actual difftastic output
- `api/routes/difftastic.ts` - Fixed to use `DFT_UNSTABLE=yes`

### Key Features

1. **API Client** - Clean async/await API for backend communication
2. **Transformer** - Converts raw JSON to normalized, renderable format
3. **React Query Hook** - Automatic caching, retries, and error handling
4. **Type Safety** - Full TypeScript coverage from API to UI

### Test Phase 2

```bash
# Start backend
pnpm dev:api

# Run tests
./test-phase2.sh
```

### Key Discoveries

- Difftastic requires `DFT_UNSTABLE=yes` for JSON output
- Language auto-detected from file extension
- Character-level change granularity
- Built-in syntax highlighting hints

**Read `PHASE2_COMPLETE.md` for full details.**

---

**Next: Phase 3 - Rendering Layer**

🚀 Great progress! The data layer is ready. Time to build the UI!
