# Cyber Crime Management System

## Overview

This is a full-stack web application designed for managing cyber crime cases and data. Its primary purpose is to provide a dashboard interface for tracking various cyber crimes, including hacking, phishing, malware, and ransomware. Key capabilities include comprehensive case management with detailed tracking of stolen amounts, investigation statuses, and advanced data filtering and visualization. The system is built as a secure data management platform featuring user authentication, role-based access, and robust cyber crime case tracking functionality.

## User Preferences

Preferred communication style: Simple, everyday language (Spanish).

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite build tool)
- **UI Library**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system variables
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **UI/UX Decisions**: Applied a complete dark "hacker-style" aesthetic with custom CSS variables, monospace fonts (JetBrains Mono, Fira Code), neon border effects, and matrix-style text effects. The interface maintains a Spanish language with uppercase hacker-style labels. Includes dynamic configuration options for color themes, transparency, font size, and visual effects, with real-time preview and persistence.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit Auth integration with OpenID Connect

### Data Storage
- **Database**: PostgreSQL (Neon serverless driver)
- **Schema Management**: Drizzle Kit
- **Session Storage**: PostgreSQL-backed session store
- **Data Models**: Cyber crime cases, users, sessions, and user_settings with proper relationships.

### Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect)
- **Session Management**: Server-side sessions with secure cookies
- **Authorization**: Route-level protection with user context middleware
- **User Management**: Automatic user creation/update on authentication, and user-specific settings persistence in the database.

### Key Design Patterns
- **Monorepo Structure**: Shared types and schemas between frontend and backend.
- **Type Safety**: End-to-end TypeScript with Zod schema validation.
- **Component Architecture**: Modular UI components with separation of concerns.
- **Error Handling**: Centralized error handling.
- **Responsive Design**: Mobile-first approach.

### Feature Specifications
- **Case Management**: Detailed tracking, filtering, and visualization of cyber crime cases.
- **System Configuration**: Customizable UI settings (color theme, transparency, fonts, visual effects).
- **AI Assistant (Asistente IA)**: AI-powered chatbot specialized in cybercrime investigation (rule-based, Spanish language).
- **Intelligence (Inteligencia)**: Advanced search system for cybercrime research with multiple search modes and export functionality.
- **Administrative Sections**: User management, report generation, and chatbot configuration.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting.
- **Replit Auth**: Authentication service with OpenID Connect integration.

### Frontend Dependencies
- **React Ecosystem**: React 18+ with TypeScript.
- **UI Framework**: Radix UI primitives.
- **Styling**: Tailwind CSS.
- **Data Fetching**: TanStack React Query.
- **Form Handling**: React Hook Form.

### Backend Dependencies
- **Express.js**: Web application framework.
- **Drizzle ORM**: TypeScript ORM.
- **Passport.js**: Authentication middleware.
- **Session Management**: Express-session with PostgreSQL store.

### Development Tools
- **Build Tools**: Vite (frontend), esbuild (backend).
- **Type Checking**: TypeScript compiler.
- **Database Tools**: Drizzle Kit.