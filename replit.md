# Overview

BombCall is a professional automated calling system built with React + Express.js that integrates with Twilio for VoIP communications. The system provides comprehensive call management capabilities including DID (Direct Inward Dialing) management, campaign processing, user administration, and payment processing. It features a modern dark-themed UI with real-time monitoring, webhook recovery systems, and production-grade optimizations for high-traffic scenarios.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement for development
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system featuring premium dark theme
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with role-based authentication
- **Authentication**: JWT tokens with refresh token rotation
- **Middleware**: Custom compression, caching, and domain detection middleware
- **Error Handling**: Comprehensive error boundary system with auto-recovery

## Database & ORM
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Relational design with users, twilio_accounts, dids, calls, campaigns, and payment tables
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless driver with WebSocket support

## Core Services
- **Twilio Integration**: Multi-account management with DID allocation and webhook handling
- **DID Manager**: Production-grade allocation system with automatic release and health monitoring
- **Campaign Processor**: Background queue processing for bulk calling operations
- **Webhook Recovery**: Comprehensive failure recovery system for missed Twilio callbacks
- **Auto Cleanup**: Automated maintenance for data integrity and system health

## Performance Optimizations
- **Caching**: Multi-layer caching with intelligent TTL strategies
- **Compression**: Response compression for payloads over 1KB
- **Database**: Optimized indexes for frequently accessed queries
- **Memory**: Garbage collection tuning and memory optimization
- **Connection Pooling**: Enhanced PostgreSQL connection management

## Authentication & Security
- **JWT Management**: Secure token generation with environment-based secrets
- **Role-Based Access**: Admin and user roles with protected routes
- **Password Security**: bcrypt hashing with salt rounds
- **API Security**: Bearer token authentication with automatic cleanup

## Deployment Configuration
- **Platform Detection**: Dynamic domain detection for Replit, VPS, and cloud platforms
- **Environment Handling**: Automatic configuration based on deployment target
- **Asset Management**: Static file serving with cache busting
- **Health Monitoring**: Real-time system health checks and recovery mechanisms

# External Dependencies

## Core Infrastructure
- **Twilio API**: VoIP calling service with webhook callbacks for call status updates
- **PostgreSQL Database**: Primary data storage with connection via DATABASE_URL environment variable
- **JWT Secret**: Cryptographic signing key for authentication tokens (JWT_SECRET)

## Development Platform
- **Replit**: Primary deployment platform with automatic domain detection
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections

## Payment Integration
- **Bank Transfer System**: Vietnamese banking integration for balance top-ups
- **MoMo Wallet**: Mobile payment gateway integration
- **ZaloPay**: Alternative payment processing option

## External APIs
- **Twilio REST API**: Account management, phone number provisioning, and call initiation
- **Webhook Endpoints**: Real-time call status updates and voice response handling
- **Domain Detection**: Automatic platform detection for webhook URL generation

## Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `TWILIO_ACCOUNT_SID`: Primary Twilio account identifier  
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `JWT_SECRET`: Cryptographic key for JWT token signing
- `NODE_ENV`: Environment designation (development/production)

# Deployment Scripts

## Enhanced SETUP.sh - One-Click Integrated Setup
The project now includes SETUP.sh that integrates all deployment scripts (SETUP.sh + replit-build.mjs + replit-start.mjs) into one comprehensive solution with all 10 required workflow elements:

### Core Features
1. **Environment Detection**: Auto-detects Replit vs VPS deployment
2. **DATABASE_URL Validation**: Enforces database setup before proceeding
3. **JWT_SECRET Generation**: Auto-generates secure JWT secrets
4. **Database Reset**: Optional full database reset functionality
5. **Schema Migration**: Automated database schema deployment
6. **Admin User Creation**: Default admin account setup
7. **Project Build**: Production asset compilation
8. **Webhook Configuration**: Automated Twilio webhook setup
9. **Setup State Tracking**: Flag files and completion status
10. **Detailed Logging**: Comprehensive step-by-step progress tracking

### Integrated Features
- **replit-build.mjs**: Integrated into Step 7 (Project Build)
- **replit-start.mjs**: Integrated with --start flag for auto-server startup
- **Port Consistency**: Forces port 5000 identical to preview environment
- **Static Assets**: Handles server/public/ directory for production serving

### Usage Modes
- `./SETUP.sh` - Auto-detection mode (complete 10-step setup)
- `./SETUP.sh --clean` - Clean installation with database reset
- `./SETUP.sh --quick` - Quick setup without prompts
- `./SETUP.sh --reset` - Full system reset (danger mode)
- `./SETUP.sh --start` - Complete setup + auto-start server (true one-click)

### Requirements
- **Replit**: Only DATABASE_URL in Secrets required
- **VPS**: DATABASE_URL in .env file (DOMAIN optional)
- The script handles JWT_SECRET generation automatically

## One-Click Enhanced Setup (ENHANCED_SETUP.sh)
A complete integration of all deployment scripts into a single one-click solution:

### Integrated Scripts
- **SETUP.sh**: Complete 10-step workflow
- **replit-build.mjs**: Production asset compilation (integrated into Step 7)
- **replit-start.mjs**: Production server startup (available with --start flag)

### Key Features
- **True One-Click**: Single command does everything from setup to server start
- **Port Consistency**: Forces port 5000 identical to preview environment
- **Asset Management**: Handles static file serving via server/public/
- **Auto-Start Option**: Optional server startup after setup completion
- **Production Parity**: 100% identical deployment to preview environment

### Usage Commands
```bash
./ENHANCED_SETUP.sh         # Complete setup only
./ENHANCED_SETUP.sh --clean # Setup with database reset
./ENHANCED_SETUP.sh --quick # Quick setup (skip prompts)
./ENHANCED_SETUP.sh --start # Setup + auto-start server
```

### Integration Benefits
- No need to run multiple scripts separately
- Guaranteed consistency between build and start processes
- Production deployment identical to preview environment
- Complete automation suitable for commercial distribution