# Medication Tracker Application

## Overview

This is a full-stack medication tracking application built with React, Express, and TypeScript. The application helps users manage their medications, track doses, monitor symptoms, and configure emergency contacts. It features a mobile-first design with a bottom navigation interface and includes functionality for camera-based pill identification, notification scheduling, symptom tracking, and a comprehensive medication database with over 20 common medications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and bundling
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **Request Handling**: Express middleware for JSON parsing and request logging
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot module replacement with Vite integration

### Data Storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver
- **Schema**: Structured tables for medications, doses, symptoms, and user settings
- **Development Storage**: In-memory storage implementation for development/testing
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Core Entities
1. **Medications**: Store medication information including name, dosage, frequency, timing, and food requirements
2. **Medication Doses**: Track individual dose instances with scheduling and completion status
3. **Symptoms**: Log symptom descriptions with severity ratings and timestamps
4. **User Settings**: Store emergency contacts, doctor information, and notification preferences

### Frontend Components
- **Dashboard**: Main view showing today's medications and recent symptoms
- **Medication Management**: CRUD operations for medications with camera integration and database search
- **Medication Search**: Comprehensive search through 20+ common medications with auto-complete
- **Symptom Tracking**: Log symptoms with severity ratings and view historical data
- **Settings**: Configure user preferences and emergency contacts
- **Camera Modal**: Integration for pill identification (placeholder implementation)

### Backend Services
- **Storage Interface**: Abstract storage layer supporting both in-memory and database implementations
- **API Routes**: RESTful endpoints for all CRUD operations
- **Medication Database**: Comprehensive database of 20+ common medications with search functionality
- **Request Logging**: Middleware for API request monitoring

## Data Flow

1. **Client Requests**: React components use TanStack Query to make API requests
2. **API Processing**: Express routes validate input using Zod schemas and call storage methods
3. **Data Persistence**: Storage layer handles database operations through Drizzle ORM
4. **Response Handling**: JSON responses are processed by the query client and update React state
5. **UI Updates**: Components re-render based on query state changes

### Notification Flow
- Frontend requests notification permissions
- Medication schedules are processed to set up reminder notifications
- Food reminders are triggered based on medication requirements

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives
- **drizzle-orm**: Type-safe ORM for database operations
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **wouter**: Lightweight routing library
- **date-fns**: Date manipulation utilities
- **zod**: Runtime type validation through drizzle-zod

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Fast JavaScript bundler for production builds

### UI and Styling
- **class-variance-authority**: Type-safe variant handling for components
- **clsx**: Conditional className utility
- **tailwindcss-animate**: Animation utilities for Tailwind

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React application to static assets
2. **Backend Build**: ESBuild bundles Express server as ESM module
3. **Asset Generation**: Static files are output to `dist/public` directory
4. **Server Bundle**: Server code is bundled to `dist/index.js`

### Environment Configuration
- **Development**: Uses Vite dev server with HMR and Express API
- **Production**: Serves static files from Express with API routes
- **Database**: PostgreSQL connection via environment variable `DATABASE_URL`

### File Structure
- **Client Code**: `client/` directory contains React application
- **Server Code**: `server/` directory contains Express API
- **Shared Code**: `shared/` directory contains common types and schemas
- **Build Output**: `dist/` directory contains production build

The application is designed to be deployed as a single Node.js application that serves both the API and static frontend assets, making it suitable for platforms like Railway, Heroku, or similar hosting services.