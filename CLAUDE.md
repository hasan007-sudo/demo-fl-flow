# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve

# Run tests
npm run test
```

## Project Overview

This is a TanStack Start application - a full-stack React framework built on TanStack Router. The project is a landing page for "Learning Forever", an AI-powered learning platform for English coaching and interview preparation.

## Architecture

### Framework Stack
- **TanStack Start**: Full-stack framework for React with SSR capabilities
- **TanStack Router**: File-based routing with type safety
- **Vite**: Build tool and development server
- **Tailwind CSS v4**: Styling (configured via Vite plugin)
- **Vitest**: Testing framework with jsdom and React Testing Library
- **Lucide React**: Icon library

### Key Configuration
- **Path Aliases**: `@/*` maps to `./src/*` (configured in tsconfig.json and vite.config.ts)
- **TypeScript**: Strict mode enabled with bundler module resolution
- **Port**: Development server runs on port 3000 (specified in package.json)
- **Colors**: Primary brand color is orange-500 (#f97316)

### Route System
Routes are file-based and live in `src/routes/`. TanStack Router auto-generates `src/routeTree.gen.ts` from route files.

- **Root Route**: `src/routes/__root.tsx` - Contains the shell component (RootDocument) that wraps all routes with header, devtools, and scripts
- **Landing Page**: `src/routes/index.tsx` - Main landing page with hero, services, features, and pricing sections
- **Header**: `src/components/Header.tsx` - Simple header with logo and navigation links

### Component Structure
The landing page (`src/routes/index.tsx`) contains:
- Hero section with call-to-action
- Services cards (English Coach, Interview Preparer)
- Feature sections with alternating layouts (24/7 AI Learning, Progress Analytics)
- Pricing plans grid (4 tiers: Free Trial, Starter, Growth, Professional)
- Footer with wave effect and waitlist CTA

### Server Functions
Server functions allow server-side code execution from client components with full type safety.

Pattern:
```typescript
const myServerFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Server-side code (has access to Node.js APIs like fs)
    return data
  })
```

Server functions can:
- Access Node.js APIs (fs, path, etc.)
- Use input validators for POST requests
- Be called from client components with full type inference
- Be used in route loaders for SSR data loading

### Router Configuration
The router instance is created in `src/router.tsx` with:
- Scroll restoration enabled
- Zero default preload stale time
- Generated route tree from `src/routeTree.gen.ts`

## Important Patterns

### Route Definition
```typescript
export const Route = createFileRoute('/path')({
  component: ComponentName,
  loader: async () => {
    // Data loading logic (runs server-side for SSR)
    return data
  },
  head: () => ({
    meta: [...],
    links: [...]
  })
})
```

### File Naming
Routes use dot-notation for nested paths:
- `index.tsx` → `/`
- `about.tsx` → `/about`
- `__root.tsx` → Root layout

### Styling
- Custom wave animation in `src/styles.css` for footer transition
- Tailwind utility classes for all styling
- Responsive design with mobile-first approach
- Orange-500 primary color theme throughout

### Testing Setup
- Uses Vitest with jsdom environment
- React Testing Library available for component tests
- No vitest.config.ts file - configuration likely in vite.config.ts or package.json
