# The RPG Vault - Community Website for Tabletop RPGs

## Overview

The RPG Vault is a full-stack community website for tabletop role-playing game enthusiasts, modeled after BoardGameGeek. The application allows users to discover, review, and discuss RPGs of all genres. It features a comprehensive review system, community forums, ranking pages, and administrative tools for content moderation.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- January 22, 2025: Removed "Mystery / Investigation" category from rankings page main category section at user request
- January 22, 2025: Implemented complete forum functionality with category-based organization, discussion creation, threaded conversations, and navigation integration - includes 5 forum categories (General Discussion, Game Reviews, Rules Questions, Play Reports, Homebrew Content) with working thread creation and reply system
- January 22, 2025: Added 10 Dungeon Crawl Classics adventures from Goodman Games (2012-2019) - includes popular adventures like Sailors on the Starless Sea, Doom of the Savage Kings, and The Chained Coffin
- January 22, 2025: Replaced purple homepage banner with custom RPG artwork featuring diverse game genres, maintained text overlay with enhanced readability
- January 22, 2025: Implemented Featured RPG system - admins can toggle products as featured using switch on product pages, featured RPGs display with golden crown badges and appear in homepage featured section with real-time updates
- January 22, 2025: Fixed ThorB login issue - password hash was outdated in database, ran admin setup script to refresh credentials
- January 22, 2025: Completely resolved navigation runtime errors by replacing auth page redirects with inline modal system - eliminated problematic browser back button sequence, users now authenticate directly on current page without navigation
- January 22, 2025: Fixed TypeScript error in RPG details page (null check for reviewCount)
- January 22, 2025: Implemented complete "Forgot Password" feature with SendGrid email integration - added password reset tokens table, secure token generation, email templates, frontend forms, and reset password page with comprehensive error handling
- January 22, 2025: Fixed authentication system runtime errors - resolved data type conversion issues, improved query error handling, and stabilized login/logout functionality for both admin and regular users
- January 22, 2025: Updated user account passwords - ThorB (admin): "admin123", Stormgod (regular user): "password123" 
- January 22, 2025: Implemented comprehensive duplicate prevention system with database constraints, API error handling, and real-time frontend duplicate detection warnings for admins
- January 22, 2025: Removed 545 duplicate adventure records from database - cleaned from 701 total records down to 156 unique adventures with no duplicates remaining
- January 22, 2025: Fixed header search functionality to navigate to browse page with URL parameters and auto-populate search field
- January 22, 2025: Fixed community photo approval system - photos now display correctly after approval with proper image URLs
- January 22, 2025: Created admin photo approval interface at /admin/photos for reviewing community submissions
- January 22, 2025: Replaced Type dropdown with System dropdown on Browse RPGs page (17 RPG systems available)
- January 22, 2025: Removed Forums navigation link since each adventure has individual comment sections for discussion
- January 22, 2025: Implemented pagination system for rankings page to handle 701+ adventures with 50 per page navigation
- January 22, 2025: Fixed review submission database precision issue - updated rating fields to support 10.0 ratings (precision 4, scale 1-2)
- January 22, 2025: Fixed review display data conversion issues and cache invalidation for real-time stats updates
- January 22, 2025: Created comprehensive RPG adventure submission system with email functionality to tbiafore@gmail.com for admin review
- January 22, 2025: Added Submit RPG Adventure form with comprehensive fields (title, description, system, genre, publisher, year, theme, type)
- January 22, 2025: Updated Quick Actions to link to new submission form instead of admin panel
- January 22, 2025: Fixed routing and nodemailer import issues for adventure submission email functionality
- January 22, 2025: Fixed rankings page map error by ensuring rankedRpgs is always an array and added proper error handling
- January 22, 2025: Fixed SelectItem console errors by replacing empty string values with "all" in browse-rpgs and rankings pages  
- January 22, 2025: Added category mapping in backend to handle 15 different category types (steampunk-dieselpunk, science-fantasy, etc.) and map them to actual database genres
- January 22, 2025: Fixed dynamic genre filtering on home page "Top Ranked Adventures" section - tabs now filter results instead of navigating to another page
- January 22, 2025: Added 19 authentic superhero RPG adventures across 7 superhero systems (1984-2023)
- January 22, 2025: Superhero tab now displays classic adventures including Secret Wars, Dr. Destroyer, Necessary Evil
- January 22, 2025: Fixed superhero tab genre mapping - superhero adventures now display correctly instead of sci-fi content
- January 22, 2025: Database contains 166 total adventures across 18 RPG systems (added Dungeon Crawl Classics with 10 classic adventures)
- January 22, 2025: Added 21 authentic Delta Green modern/urban horror adventures spanning 1997-2022
- January 22, 2025: Modern/Urban tab now displays content including Night Floors, Iconoclasts, Future/Perfect campaign
- January 22, 2025: Added 4 Boot Hill Western adventures to historical genre - BH1-BH4 (1981-1983) from TSR
- January 22, 2025: Historical tab now displays authentic Western adventures instead of empty results
- January 22, 2025: Fixed adventure detail pages to scroll to top when loaded instead of starting at bottom
- January 22, 2025: Made homepage adventure rankings clickable with hover effects and direct links to adventure detail pages
- January 22, 2025: Removed duplicate I6 Ravenloft entry and ensured all D&D adventures are categorized as fantasy genre
- January 22, 2025: Database now contains 188 total adventures (removed 1 duplicate)
- January 22, 2025: Fixed Modern/Urban tab to show empty results (Call of Cthulhu adventures now exclusive to Horror tab)
- January 22, 2025: Fixed Historical tab to show empty results (no historical adventures in database yet)
- January 22, 2025: Added Modern/Urban and Superhero tabs to homepage "Top Ranked Adventures" section (7 total tabs now)
- January 22, 2025: Added 30 authentic Call of Cthulhu horror adventures spanning multiple systems (Call of Cthulhu, Pulp Cthulhu, Cthulhu Invictus)
- January 22, 2025: Database now contains 189 total RPG adventures across 8 systems with proper genre categorization
- January 22, 2025: Increased "Top Ranked Adventures" display from 3 to 10 adventures for all categories (Overall, Fantasy, Sci-Fi, Horror, Historical)
- January 22, 2025: Updated all D&D 5e adventures to fantasy genre for consistency (previously some were horror)
- January 22, 2025: Added 21 D&D 5e adventures (2014-2024) including Curse of Strahd, Tomb of Annihilation, and Vecna: Eve of Ruin
- January 22, 2025: Cleaned up duplicate database entries caused by multiple seed script runs
- January 22, 2025: Database contains 189 authentic RPG adventures across 8 systems: AD&D 1e (50), Cyberpunk 2020 (48), D&D 5e (42), Call of Cthulhu (27), Cyberpunk Red (12), Cyberpunk 2013 (6), Pulp Cthulhu (3), Cthulhu Invictus (1)
- January 22, 2025: Added 33 Cyberpunk RPG adventures spanning three editions (Cyberpunk 2013, 2020, and Red) from R. Talsorian Games (1988-2024)
- January 22, 2025: Replaced temporary RPG data with 25 classic D&D adventure modules from TSR (A1-A4, C1-C2, D1-D3, G1-G3, I1/I3/I6, Q1, S1-S4, T1/T1-4, U1-U3)
- January 22, 2025: All adventures properly categorized with RPG systems, publishers, and historical publication years (1978-2024)
- January 22, 2025: Database successfully seeded with authentic classic D&D adventure content including detailed descriptions
- January 22, 2025: Fixed TypeScript compilation errors in admin panel and schema definitions
- January 22, 2025: Created comprehensive Adventure Detail Page system with photo galleries, threaded comments, and adventure-specific metadata (type, theme, summary)
- January 22, 2025: Enhanced database schema with adventure photos, comments, and voting tables for community features
- January 22, 2025: Added API routes for photo uploads, comment management, and community interactions
- January 22, 2025: Redesigned RPG details page with enhanced sidebar showing rankings and adventure details
- January 21, 2025: Implemented comprehensive RPG category system with 15 main categories and 50+ subcategories
- January 21, 2025: Enhanced rankings page with hierarchical category selection and Bayesian rating display
- January 21, 2025: Added Bayesian rating system with mathematical formula to prevent rating inflation from small vote counts
- January 21, 2025: Updated website branding from "RPGGeek" to "The RPG Vault" across all components, pages, and documentation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and express-session
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt hashing
- **API Design**: RESTful endpoints with consistent error handling

### Database Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema**: Defined in shared TypeScript files for frontend/backend consistency
- **Migrations**: Drizzle Kit for schema management and migrations

## Key Components

### Category System
The application features a comprehensive hierarchical category system:

- **15 Main Categories**: Fantasy, Science Fiction, Horror, Historical, Mystery/Investigation, Superhero, Modern/Urban, Anime/Manga, Steampunk/Dieselpunk/Atompunk, Science Fantasy, Wuxia/Eastern, Mythological, Comedy/Satirical, Anthropomorphic, Children/Family-Friendly
- **50+ Subcategories**: Each main category includes detailed subcategories for precise classification (e.g., Fantasy → High Fantasy, Low Fantasy, Sword & Sorcery, Urban Fantasy, Dark Fantasy)
- **Contextual Information**: Each subcategory includes descriptions and example games for user guidance
- **Dynamic UI**: Category selection interface adapts to show relevant subcategories when a main category is selected

### Database Schema
The application uses a well-structured PostgreSQL schema with the following main entities:

1. **Users**: Authentication and profile management
   - Secure password hashing with salt
   - Admin role support
   - Session-based authentication

2. **RPG Items**: Core content entities
   - Hierarchical categorization system with main categories and subcategories
   - Typed by content (core-rules, adventure, setting, etc.)
   - Support for various game systems
   - Dual rating system: traditional average ratings and Bayesian-adjusted ratings
   - Automatic rating recalculation with mathematical precision

3. **Reviews**: User-generated content
   - 1-10 rating scale
   - Text reviews with timestamps
   - Linked to users and RPG items

4. **Forum System**: Community discussion
   - Hierarchical structure: Categories → Threads → Posts
   - User attribution and timestamps
   - Category types for organized discussions

### Authentication System
- Session-based authentication using secure cookies
- Password hashing with scrypt and random salts
- Role-based access control (admin/user)
- Protected routes on both frontend and backend
- Automatic session management with PostgreSQL storage

### API Structure
RESTful API endpoints organized by resource:
- `/api/auth/*` - Authentication endpoints
- `/api/rpgs/*` - RPG item CRUD operations
- `/api/reviews/*` - Review management
- `/api/rankings/*` - Ranking calculations
- `/api/forum/*` - Forum operations

### Frontend Components
- Reusable UI components built on Radix primitives
- Responsive design with mobile-first approach
- Dark theme with purple/amber accent colors
- Rating displays, cards, and form components
- Protected routing with authentication checks

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Backend validates against database using scrypt comparison
3. Passport.js creates authenticated session
4. Session stored in PostgreSQL with connect-pg-simple
5. Frontend receives user data and updates query cache
6. Protected routes check authentication status

### Content Management Flow
1. Users browse RPGs with filtering and search
2. Individual RPG pages display details and reviews
3. Authenticated users can submit reviews with ratings
4. Average ratings automatically calculated and cached
5. Rankings generated from aggregated review data
6. Admin users can create/edit/delete RPG entries

### Forum Flow
1. Categories organize different discussion topics
2. Users create threads within categories
3. Posts added to threads in chronological order
4. User attribution and timestamps maintained
5. Moderation tools available for admin users

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, Wouter for routing
- **Styling**: TailwindCSS, Radix UI components
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form, Zod validation
- **Utilities**: date-fns, clsx, class-variance-authority

### Backend Dependencies
- **Web Framework**: Express.js, Passport.js
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Authentication**: express-session, connect-pg-simple
- **Security**: Node.js crypto module

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **Type Checking**: TypeScript with strict mode
- **Database Tools**: Drizzle Kit for migrations
- **Development**: tsx for TypeScript execution

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for running TypeScript backend directly
- PostgreSQL database via Neon serverless
- Session storage in same PostgreSQL instance

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with esbuild for Node.js
- Express serves both API and static frontend
- Single deployment artifact

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session security via `SESSION_SECRET` environment variable
- Neon WebSocket configuration for serverless deployment
- Trust proxy settings for production deployment

### File Structure
- `/client` - React frontend application
- `/server` - Express backend application  
- `/shared` - Common TypeScript definitions and schemas
- `/migrations` - Database migration files
- Monorepo structure with shared TypeScript configuration

The application follows a modern full-stack architecture with type safety throughout, responsive design, and scalable database design suitable for a community-driven content platform.