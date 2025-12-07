# Lost City Surveyor - Archaeological Puzzle Game

## Overview

Lost City Surveyor is a browser-based archaeology puzzle game that combines strategic resource management with educational content about archaeological survey techniques. Players use various scientific tools (Multispectral Imaging, LiDAR, GPR) to discover hidden ancient structures on a grid-based map while managing a limited budget. The application features a user authentication system, competitive leaderboard, and responsive design for both desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for the UI layer
- Vite as the build tool and development server
- Custom game engine built with vanilla JavaScript (ES6 modules) using HTML5 Canvas for rendering
- Component architecture splits between React (UI/menus) and vanilla JS (game logic)

**Styling & UI Components:**
- Tailwind CSS v4 for utility-first styling with custom cyberpunk/LIDAR aesthetic
- shadcn/ui component library (Radix UI primitives) for consistent UI patterns
- Custom CSS variables for theming (neon green grid lines, dark backgrounds)
- Responsive design using CSS Flexbox/Grid with mobile-first considerations

**Game Engine Design:**
The game uses a modular architecture with clear separation of concerns:
- `Game.js` - Central state manager and game loop coordinator
- `Grid.js` - Data model for the 20x20 grid and structure placement logic
- `Renderer.js` - Canvas-based rendering with device pixel ratio handling for high-DPI displays
- `Input.js` - Unified input handler supporting both mouse and touch events
- `Economy.js` - Budget and scoring system manager

**Rationale:** Separating the game engine from React allows for optimized 60fps Canvas rendering without React's virtual DOM overhead, while React handles the surrounding UI chrome efficiently.

**State Management:**
- React component state for UI screens (auth, leaderboard, overlays)
- Game state managed internally by the vanilla JS game engine
- Callbacks bridge game events to React UI updates

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and REST API routing
- Node.js with ES modules (type: "module")
- Development uses tsx for TypeScript execution; production uses esbuild-bundled output

**API Design Pattern:**
RESTful endpoints for:
- `/api/register` - User registration with bcrypt password hashing
- `/api/login` - Authentication returning user credentials
- `/api/score` - Score submission for completed games
- `/api/leaderboard` - Ranked player scores with pagination

**Rationale:** Simple REST API chosen over GraphQL or real-time solutions because the game is single-player with asynchronous leaderboard updates; no need for complex query patterns or WebSockets.

**Security:**
- bcryptjs for password hashing (10 salt rounds)
- Credentials validated server-side before database operations
- Input validation prevents duplicate usernames and malformed requests

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries and migrations
- WebSocket-based connection pooling for serverless compatibility

**Schema Design:**
Two primary tables:
1. `users` - Stores user credentials and gamertags with UUID primary keys
2. `scores` - Records game completions with foreign key to users, tracking funds, structures found, and actions used

**Rationale:** Relational database chosen because data has clear relationships (users → scores) and requires ACID guarantees for leaderboard integrity. Drizzle provides TypeScript safety while maintaining SQL transparency.

### Responsive Design Strategy

**Multi-Device Support:**
- Canvas automatically resizes to container dimensions
- Device pixel ratio scaling ensures crisp graphics on Retina/high-DPI screens
- Touch event handling with `preventDefault()` to avoid browser zoom/scroll interference
- Layout switches between desktop (canvas left, HUD right) and mobile (canvas top, HUD bottom)

**Input Abstraction:**
The `Input.js` class normalizes mouse and touch events into a unified coordinate system, mapping screen pixels to grid coordinates regardless of canvas CSS scaling.

### Build & Deployment

**Build Process:**
- `script/build.ts` orchestrates both client and server builds
- Vite bundles the frontend with React/TypeScript/Tailwind
- esbuild bundles the server with selective dependency bundling (allowlist pattern reduces cold start syscalls)
- Production build outputs to `dist/` directory

**Environment Configuration:**
- `DATABASE_URL` required for Neon PostgreSQL connection
- Development mode uses Vite dev server with HMR
- Production serves static files from Express

**Rationale:** Separate build steps allow optimization for each layer. Server bundling reduces deployment size and startup time by inlining frequently-used dependencies while externalizing large/native modules.

## External Dependencies

### Core Infrastructure
- **Neon Serverless PostgreSQL** - Managed database with WebSocket connections for serverless environments
- **Drizzle ORM** - Type-safe SQL query builder with migration tooling

### Frontend Libraries
- **React** - UI component framework
- **Vite** - Frontend build tool and dev server
- **Tailwind CSS v4** - Utility-first styling framework
- **shadcn/ui (Radix UI)** - Accessible component primitives (dialogs, buttons, forms, etc.)
- **TanStack Query** - Data fetching and caching (configured but minimal usage)
- **Lucide React** - Icon library

### Backend Libraries
- **Express.js** - Web server framework
- **bcryptjs** - Password hashing
- **ws** - WebSocket library for Neon database connections

### Development Tools
- **TypeScript** - Type safety across client and server
- **tsx** - TypeScript execution for development
- **esbuild** - Fast bundling for production server code
- **Replit Vite Plugins** - Development banner, runtime error overlay, cartographer, and custom meta image plugin

### Authentication & Security
Password-based authentication with bcrypt hashing; no external auth providers. Sessions are stateless (no session middleware currently configured, though imports suggest it was considered).