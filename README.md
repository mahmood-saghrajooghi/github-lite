# GitHub Lite

A lightweight GitHub client built with React + TypeScript + Vite, featuring structural diff viewing powered by [difftastic](https://github.com/Wilfred/difftastic).

## Features

- 🔍 Browse GitHub repositories and pull requests
- 📊 View pull request timelines and comments
- 🎨 **Structural diff viewing** with syntax-aware highlighting (difftastic integration)
- 💬 Comment on pull requests
- ⚡ Fast, modern UI with Tanstack Router & React Query
- 🎨 Beautiful UI with shadcn/ui + Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Rust and Cargo (for difftastic binary)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd github-lite
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Install difftastic**
   ```bash
   cargo install difftastic
   # Or use homebrew on macOS:
   # brew install difftastic
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

See [DIFFTASTIC_SETUP.md](./DIFFTASTIC_SETUP.md) for detailed setup instructions.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: Tanstack Router
- **State Management**: Tanstack Query (React Query)
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Diff Viewing**: react-diff-view + difftastic
- **Backend**: Express, Node.js
- **Diff Engine**: [Difftastic](https://github.com/Wilfred/difftastic) (Rust)

## Project Structure

```
github-lite/
├── api/                        # Backend API server
│   ├── server.ts              # Express server
│   └── routes/
│       └── difftastic.ts      # Difftastic API endpoint
├── src/
│   ├── app/                   # App-level components
│   ├── components/            # Shared React components
│   │   └── ui/               # shadcn/ui components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   │   └── api/             # API query hooks
│   ├── lib/                  # Utility functions
│   ├── routes/               # Tanstack Router routes
│   └── types/                # TypeScript types
└── ...
```

## Development Commands

```bash
# Start both frontend + backend
pnpm dev

# Start only frontend
pnpm dev:vite

# Start only backend API
pnpm dev:api

# Build production bundle
pnpm build

# Build backend API
pnpm build:api

# Run linter
pnpm lint

# Generate GraphQL types
pnpm codegen
```

## Documentation

- [Difftastic Integration Plan](./DIFFTASTIC_INTEGRATION_PLAN.md) - Roadmap for difftastic features
- [Difftastic Setup Guide](./DIFFTASTIC_SETUP.md) - Installation and setup instructions

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
