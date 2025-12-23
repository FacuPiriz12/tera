# Overview

This is a full-stack Google Drive file management application called "Clone Drive" built with React, Express.js, and PostgreSQL. The application allows users to authenticate via Replit's OIDC system and copy files/folders from Google Drive shared links to their personal Google Drive. It features a modern UI with shadcn/ui components, real-time copy progress tracking, and a comprehensive file management interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React 18 using TypeScript and Vite as the build tool. The UI leverages shadcn/ui components with Radix UI primitives for accessibility, styled with TailwindCSS using CSS variables for theming. State management uses TanStack Query (React Query) for server state with custom query functions for API communication. Routing is handled by Wouter for lightweight client-side navigation.

## Backend Architecture  
The server uses Express.js with TypeScript in ES module format. It implements a RESTful API architecture with route handlers organized in a centralized routes file. The application uses Passport.js with OpenID Connect strategy for Replit-based authentication, including session management with PostgreSQL session storage.

## Authentication System
The application supports two authentication methods:

### Replit OIDC Authentication
Primary authentication method using Replit's OIDC provider with Passport.js. User sessions are stored in PostgreSQL using connect-pg-simple middleware. The system includes protected routes that verify authentication status and user context propagation throughout the application.

### Supabase Authentication
Secondary authentication method for email/password signup and login. Features include:
- Email verification with confirmation links
- Password-based authentication
- Session management with JWT tokens
- OAuth integration capabilities
- Email scanner protection through intermediate confirmation pages
- Module-level session caching to prevent race conditions

**Configuration Requirements:**
- SUPABASE_URL: Your Supabase project URL
- SUPABASE_ANON_KEY: Supabase anonymous/public key
- Redirect URLs must be configured in Supabase Dashboard:
  - Production: https://your-app.onrender.com/auth/confirm
  - Development: http://localhost:5000/auth/confirm
  - Wildcard: https://your-app.onrender.com/**

**Email Confirmation Flow:**
The application uses an intermediate confirmation page to prevent email scanners from consuming verification tokens prematurely. When users click the email confirmation link, they are redirected to a page with a manual confirmation button, ensuring the token is only consumed when the user explicitly confirms.

**Session Cache Architecture:**
To prevent race conditions where API requests execute before the Supabase session token is available, the application implements a module-level session cache:

1. **Module-Level Initialization** (`client/src/lib/supabase.ts`):
   - The Supabase client initialization fetches the current session immediately
   - Updates a module-level cache with `setCachedSession(session)`
   - Establishes an `onAuthStateChange` listener that updates the cache on every auth state change
   - This happens at module load, BEFORE any React components mount or React Query executes

2. **Cache Module** (`client/src/lib/supabaseSession.ts`):
   - Simple module that maintains the current session in memory
   - Provides `getCachedSession()` and `setCachedSession()` functions
   - Cache is always up-to-date because it's updated by the module-level listener

3. **Request Headers** (`client/src/lib/queryClient.ts`):
   - `getAuthHeaders()` uses `getCachedSession()` instead of calling `supabase.auth.getSession()`
   - This ensures the token is ALWAYS available, even immediately after login
   - Eliminates race conditions where queries execute before session is persisted

4. **Backend Middleware** (`server/replitAuth.ts`):
   - The `isAuthenticated` middleware verifies Supabase JWT tokens via the Authorization header
   - In production deployments without Replit Auth (no REPLIT_DOMAINS), returns 401 cleanly instead of 500
   - Supports both Replit Auth (cookies) and Supabase (Bearer tokens)

**Benefits:**
- No race conditions during login or page refresh
- Deterministic authentication flow that doesn't depend on timing
- Works reliably in production with Supabase-only authentication
- Supports dual authentication (Replit Auth for development, Supabase for production)

## Database Layer
PostgreSQL database with Drizzle ORM for type-safe database operations. The schema includes user management tables (required for Replit Auth), drive file tracking, copy operations with progress tracking, and session storage. Database migrations are managed through Drizzle Kit with schema versioning.

## File Management System
Integrates with multiple cloud storage providers through dedicated service layers:

### Google Drive Integration
Uses Google Drive API with OAuth2 authentication for secure access. Supports parsing Google Drive URLs to extract file/folder IDs, retrieving file metadata and information, and copying files/folders with progress tracking. Copy operations are managed asynchronously with real-time status updates.

### Dropbox Integration (Manual Setup)
Implemented as a manual alternative to Replit's Dropbox integration. Uses Dropbox SDK for JavaScript with OAuth2 authentication flow. Features include:
- OAuth2 authentication and token management
- File listing, upload, and download operations  
- Shared link generation for file access
- Folder creation and management
- Token storage in database with connection status tracking

**Setup Requirements:**
- DROPBOX_APP_KEY: Application key from Dropbox Developer Console
- DROPBOX_APP_SECRET: Application secret from Dropbox Developer Console
- Redirect URI must be configured in Dropbox app settings

The system stores Dropbox tokens separately from Google Drive tokens, allowing users to connect to both services simultaneously.

## Real-time Features
Implements Server-Sent Events (SSE) for real-time transfer progress updates. The system includes:

### Global Transfer Context
A global React context (`TransferContext`) manages transfer operations at the application level, ensuring transfers continue running even when users navigate between sections:

1. **TransferProvider** (`client/src/contexts/TransferContext.tsx`):
   - Maintains SSE connection for real-time job updates
   - Fetches active jobs on mount to restore state after page reload
   - Automatically reconnects with exponential backoff on connection loss
   - Clears state on logout to prevent session bleed
   - Reconciles job state to prevent duplicates and remove stale entries

2. **GlobalTransferIndicator** (`client/src/components/GlobalTransferIndicator.tsx`):
   - Persistent floating panel visible from any page
   - Shows active, completed, and failed transfers
   - Expandable/collapsible/minimizable interface
   - Links to open completed files and view all operations

3. **Key Features**:
   - Transfers continue running in background when navigating away
   - Progress updates visible from any section of the app
   - Automatic state recovery on page reload
   - Session-scoped job tracking (cleared on logout)

## Scheduled Tasks System
Automated task scheduling system for recurring file copy operations between cloud storage providers.

### Architecture
1. **Scheduler Service** (`server/services/schedulerService.ts`):
   - Background service that polls every 60 seconds for tasks due for execution
   - Automatically calculates next run time based on configured frequency
   - Supports hourly, daily, weekly, and monthly schedules
   - Monitors task completion and updates execution history
   - Starts automatically with the server

2. **Database Schema** (`shared/schema.ts`):
   - `scheduled_tasks`: Stores task configuration, schedule, and execution statistics
   - `scheduled_task_runs`: Execution history with duration, files processed, and error tracking
   - Fields for source/destination providers, schedule configuration (hour, minute, day), and notification preferences

3. **API Routes** (`server/routes.ts`):
   - `GET /api/scheduled-tasks`: List user's scheduled tasks
   - `POST /api/scheduled-tasks`: Create new scheduled task
   - `PATCH /api/scheduled-tasks/:id`: Update task configuration
   - `DELETE /api/scheduled-tasks/:id`: Delete task (soft delete)
   - `POST /api/scheduled-tasks/:id/pause`: Pause scheduled task
   - `POST /api/scheduled-tasks/:id/resume`: Resume paused task
   - `POST /api/scheduled-tasks/:id/run-now`: Execute task immediately
   - `GET /api/scheduled-tasks/:id/runs`: Get task execution history

4. **Frontend Page** (`client/src/pages/Tasks.tsx`):
   - Full CRUD interface for managing scheduled tasks
   - Create/edit forms with frequency selection, time configuration
   - Task status display (active, paused) with last run status
   - Execution history and statistics
   - Quick actions: run now, pause/resume, edit, delete

### Usage
1. Navigate to "Tareas Programadas" in the sidebar
2. Click "Nueva tarea" to create a scheduled copy operation
3. Configure source URL, destination, and schedule frequency
4. The scheduler will automatically execute copies according to the schedule
5. View execution history and statistics in the task details

### Supported Frequencies
- **Hourly**: Executes at the specified minute every hour
- **Daily**: Executes at the specified hour:minute every day
- **Weekly**: Executes on the specified day of week at the set time
- **Monthly**: Executes on the specified day of month at the set time

## Development Environment
Configured for Replit development with hot module replacement via Vite. Includes development-specific middleware for error overlay and source mapping. The build process uses esbuild for server bundling and Vite for client optimization.

## Duplicate Detection System
Intelligent duplicate file detection using combined approach: metadata + hash-based verification.

### Architecture
1. **Metadata-First Matching** (`duplicateDetectionService.ts`):
   - Quick matching by filename + fileSize + provider
   - Identifies potential duplicates instantly

2. **Hash Verification** (SHA-256):
   - Content hash calculation for definitive duplicate confirmation
   - Prevents false positives from same-named files with different content

3. **Database Tracking** (`file_hashes` table):
   - Persistent tracking of file hashes per user
   - Indexed by content hash and metadata for fast lookups

### Features
- **Automatic Detection**: Checks for duplicates before every file copy/transfer
- **Cross-Platform**: Works for Google Drive ↔ Dropbox transfers (both directions)
- **User Control**: Choose action on duplicates (skip, replace, copy with suffix)
- **Scheduled Tasks**: Define duplicate handling strategy when creating tasks
- **Scalable**: Indexed database queries for performance

### How It Works

#### For Manual Copies & Transfers:
1. **Pre-Upload Check**:
   - Calculates SHA-256 hash of file content
   - Queries metadata index first (fast path)
   - Falls back to hash verification if needed

2. **User Options on Duplicate Detection**:
   - **Omitir (Skip)**: Skip this file, don't upload
   - **Copiar de todas formas (Copy with suffix)**: Upload as `filename_copy.ext`
   - **Reemplazar (Replace)**: Overwrite existing file

3. **Registration**:
   - After successful upload, registers file hash in database
   - Enables detection for future transfer attempts

#### For Scheduled Tasks:
1. **Task Configuration**:
   - Set `duplicateAction` field when creating/editing task
   - Options: `skip` | `replace` | `copy_with_suffix`
   - Applied automatically during scheduled executions

2. **Automatic Handling**:
   - No user interaction needed - applies configured action
   - Logs duplicate detections in task execution history
   - Continues processing remaining files

### Database Fields
- `file_hashes`: SHA-256 hashes for duplicate detection
- `scheduledTasks.duplicateAction`: Strategy for task (skip|replace|copy_with_suffix)

### Detection Modes
- Metadata match: Same name + size + provider
- Hash match: Same content (catches renamed duplicates)

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework with middleware ecosystem
- **Vite**: Build tool and development server with HMR

## Database & ORM
- **PostgreSQL**: Primary database via Neon serverless
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **Drizzle Kit**: Database migrations and schema management

## Authentication & Security
- **Passport.js**: Authentication middleware framework
- **OpenID Client**: OIDC authentication for Replit integration
- **Express Session**: Session management with PostgreSQL storage
- **connect-pg-simple**: PostgreSQL session store adapter

## UI & Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives
- **TailwindCSS**: Utility-first CSS framework with design system
- **Lucide React**: Icon library for consistent iconography

## State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation and type inference

## Cloud Storage Integrations
- **Google APIs**: Google Drive API client for file operations
- **googleapis**: Official Google APIs Node.js client library
- **Dropbox SDK**: Official Dropbox API client for file operations (manual integration)

## Development & Build Tools
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with autoprefixer
- **Wouter**: Lightweight client-side routing