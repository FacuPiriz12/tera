# Overview

"Clone Drive" is a full-stack Google Drive file management application that enables users to copy files and folders from shared Google Drive links to their personal Google Drive. Built with React, Express.js, and PostgreSQL, it features a modern UI using shadcn/ui, real-time copy progress tracking, and comprehensive file management. The application supports Replit OIDC authentication and integrates with Google Drive, offering robust file and task management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
The client-side is built with React 18, TypeScript, and Vite, utilizing shadcn/ui components based on Radix UI primitives for accessibility. TailwindCSS, configured with CSS variables, handles styling and theming.

## Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, TanStack Query for state management, and Wouter for routing.
- **Backend**: Express.js with TypeScript, implementing a RESTful API.
- **Authentication**: Primarily Replit OIDC via Passport.js, with an alternative Supabase email/password authentication method featuring email verification, JWT-based session management, and a module-level session cache to prevent race conditions during authentication.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations, schema versioning, user management, and session storage.
- **File Management**: Integration with Google Drive API (OAuth2) for file/folder operations, metadata retrieval, and asynchronous copying with progress tracking. Dropbox integration (manual setup) provides similar functionalities using the Dropbox SDK.
- **Real-time Features**: Server-Sent Events (SSE) provide real-time transfer progress updates managed by a global `TransferContext` in React, ensuring persistent updates and state recovery.
- **Payments**: Integrated Stripe for Pro subscriptions. Endpoints include `/api/stripe/create-checkout` and `/api/stripe/webhook`. Requires `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` environment variables.
- **Duplicate Detection**: An intelligent system combines metadata and SHA-256 hash-based verification to detect duplicates before file transfers, offering user control over handling (skip, replace, copy with suffix) for both manual and scheduled operations.

## System Design Choices
- **Modular Architecture**: Clear separation between frontend and backend, with distinct services for authentication, file management, and scheduling.
- **Scalability**: Designed to handle multiple cloud storage integrations and real-time updates efficiently.
- **Robustness**: Features like automatic reconnection for SSE, session cache for authentication, and detailed error tracking for scheduled tasks enhance reliability.

# External Dependencies

## Core Frameworks
- **React 18**: Frontend development.
- **Express.js**: Backend web server.
- **Vite**: Build tool.

## Database & ORM
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Type-safe ORM.
- **Drizzle Kit**: Database migrations.

## Authentication & Security
- **Passport.js**: Authentication middleware.
- **OpenID Client**: Replit OIDC integration.
- **Express Session**: Session management.
- **connect-pg-simple**: PostgreSQL session store.

## UI & Styling
- **shadcn/ui**: Component library.
- **Radix UI**: Accessible component primitives.
- **TailwindCSS**: CSS framework.
- **Lucide React**: Icon library.

## State Management & Data Fetching
- **TanStack Query**: Server state management.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.

## Cloud Storage Integrations
- **Google APIs**: Google Drive API client.
- **googleapis**: Node.js client library for Google APIs.
- **Dropbox SDK**: Dropbox API client.

## Development & Build Tools
- **TypeScript**: Static type checking.
- **ESBuild**: JavaScript bundler.
- **PostCSS**: CSS processing.
- **Wouter**: Client-side router.