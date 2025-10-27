# Difftastic Integration Setup Guide

This guide will help you set up the difftastic integration for github-lite.

## Prerequisites

- Node.js 18+ and pnpm
- Rust and Cargo (for installing difftastic)

## Step 1: Install Difftastic Binary

### Option A: Using Cargo (Recommended)

```bash
# Install difftastic using cargo
cargo install difftastic

# Verify installation
difft --version
```

### Option B: Using Homebrew (macOS)

```bash
# Install difftastic using homebrew
brew install difftastic

# Verify installation
difft --version
```

### Option C: Download Pre-built Binary

Visit the [difftastic releases page](https://github.com/Wilfred/difftastic/releases) and download the appropriate binary for your platform.

```bash
# macOS/Linux: Move binary to PATH
sudo mv difft /usr/local/bin/
sudo chmod +x /usr/local/bin/difft

# Verify installation
difft --version
```

## Step 2: Install Project Dependencies

```bash
# Install all dependencies (including new backend dependencies)
pnpm install
```

New dependencies added:
- `express` - Web framework for API server
- `cors` - Cross-origin resource sharing
- `tsx` - TypeScript execution for Node.js
- `concurrently` - Run multiple commands concurrently
- `@types/express` - TypeScript types for Express
- `@types/cors` - TypeScript types for CORS

## Step 3: Start Development Servers

```bash
# Start both frontend (Vite) and backend (Express) servers
pnpm dev
```

This will start:
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend API**: `http://localhost:3001` (Express server)

Alternatively, you can run them separately:

```bash
# Terminal 1: Start Vite dev server
pnpm dev:vite

# Terminal 2: Start API server
pnpm dev:api
```

## Step 4: Verify Installation

### Check API Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T..."
}
```

### Check Difftastic Status

```bash
curl http://localhost:3001/api/difftastic/status
```

Expected response (if installed correctly):
```json
{
  "success": true,
  "installed": true,
  "version": "Difftastic 0.XX.X"
}
```

If difftastic is not found:
```json
{
  "success": false,
  "installed": false,
  "error": "Difftastic not found. Install with: cargo install difftastic"
}
```

## Step 5: Test the Difftastic API

You can test the API endpoint directly:

```bash
curl -X POST http://localhost:3001/api/difftastic \
  -H "Content-Type: application/json" \
  -d '{
    "oldContent": "function hello() {\n  console.log(\"Hello\");\n}",
    "newContent": "function hello() {\n  console.log(\"Hello, World!\");\n}",
    "oldPath": "test.ts",
    "newPath": "test.ts",
    "language": "typescript"
  }'
```

Expected response:
```json
{
  "success": true,
  "diff": { /* difftastic JSON output */ }
}
```

## Project Structure

After setup, your project structure includes:

```
github-lite/
├── api/                        # Backend API
│   ├── server.ts              # Express server
│   └── routes/
│       └── difftastic.ts      # Difftastic API endpoint
├── src/
│   ├── types/
│   │   └── difftastic.ts      # TypeScript types
│   └── ...
├── tsconfig.api.json          # Backend TypeScript config
└── package.json               # Updated with new scripts
```

## Development Commands

```bash
# Start both frontend + backend
pnpm dev

# Start only frontend
pnpm dev:vite

# Start only backend
pnpm dev:api

# Build frontend
pnpm build

# Build backend
pnpm build:api

# Lint
pnpm lint

# GraphQL codegen
pnpm codegen
```

## Environment Variables (Optional)

You can customize the API server port:

```bash
# .env.local
API_PORT=3001
```

## Troubleshooting

### "difft: command not found"

**Solution**: Difftastic is not installed or not in your PATH.
- Try running `cargo install difftastic`
- Or download from releases: https://github.com/Wilfred/difftastic/releases

### "Cannot find module 'express'"

**Solution**: Dependencies not installed.
```bash
pnpm install
```

### Port 3001 already in use

**Solution**: Change the API port.
```bash
API_PORT=3002 pnpm dev:api
```

Or kill the process using port 3001:
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### CORS errors in browser

**Solution**: Make sure both servers are running and CORS is enabled in `api/server.ts`.

### Difftastic returns parse errors

**Solution**: The `DFT_PARSE_ERROR_LIMIT` is set to 20 by default. For very complex files, you may need to increase this or fall back to traditional diff.

## Next Steps

Now that the backend infrastructure is ready, the next phases are:

1. **Phase 2**: Create data transformation layer to convert difftastic output to renderable format
2. **Phase 3**: Build React components to render structural diffs
3. **Phase 4**: Integrate with existing PR workflow
4. **Phase 5**: Add UI/UX enhancements

See `DIFFTASTIC_INTEGRATION_PLAN.md` for the complete roadmap.

## API Reference

### POST `/api/difftastic`

Process a diff using difftastic.

**Request Body**:
```typescript
{
  oldContent: string      // File content before changes
  newContent: string      // File content after changes
  oldPath: string         // File path (for extension detection)
  newPath: string         // File path (for extension detection)
  language?: string       // Optional: typescript, javascript, rust, etc.
}
```

**Response**:
```typescript
{
  success: boolean
  diff?: any             // Difftastic JSON output
  raw?: string          // Raw output if JSON parsing fails
  error?: string        // Error message if failed
}
```

### GET `/api/difftastic/status`

Check if difftastic is installed.

**Response**:
```typescript
{
  success: boolean
  installed: boolean
  version?: string      // Difftastic version if installed
  error?: string        // Error message if not installed
}
```

### GET `/health`

Health check endpoint.

**Response**:
```typescript
{
  status: "ok"
  timestamp: string     // ISO 8601 timestamp
}
```

## Resources

- [Difftastic Documentation](https://difftastic.wilfred.me.uk/)
- [Difftastic GitHub](https://github.com/Wilfred/difftastic)
- [Express.js Documentation](https://expressjs.com/)
