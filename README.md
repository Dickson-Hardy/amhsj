# AJRS - Academic Journal Research System

A comprehensive, production-ready academic journal publishing platform designed for multidisciplinary research across all academic fields.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/amhsj-platform.git
cd amhsj-platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run migrations and seed data
npm run migrate
npm run seed
npm run create-admin

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Security](#security)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AMHSJ is a full-featured academic journal platform that facilitates the complete scholarly publishing workflow from article submission to publication. The platform is specifically tailored for medical and health sciences research with features supporting:

- Clinical research and trials
- Public health studies
- Biomedical sciences
- Healthcare innovation
- Medical education research

### Key Highlights

- **Complete Editorial Workflow**: Automated peer review with smart reviewer assignment
- **Real-time Collaboration**: Live editing and commenting system
- **Advanced Search**: Full-text search with medical ontology support
- **Integration Ready**: DOI generation, ORCID, CrossRef, and academic databases
- **Performance Optimized**: Redis caching, CDN-ready, sub-second response times
- **Security Hardened**: RBAC, rate limiting, input validation, audit trails

## ✨ Features

### Editorial System
- **Manuscript Submission**: Multi-step submission with validation
- **Peer Review**: Automated reviewer assignment and tracking
- **Decision Management**: Accept/reject/revision workflows
- **Version Control**: Track manuscript revisions and changes
- **Communication Center**: Integrated messaging system

### User Management
- **Role-based Access**: Authors, Reviewers, Editors, Administrators
- **Profile Management**: ORCID integration, expertise tracking
- **Application System**: Reviewer and editor applications
- **Activity Tracking**: Comprehensive user activity logs

### Advanced Features
- **Real-time Notifications**: In-app and email notifications
- **Document Management**: PDF generation, version tracking
- **Citation Management**: Automatic citation formatting
- **Plagiarism Detection**: Integration with detection services
- **Analytics Dashboard**: Usage statistics and metrics

### Technical Features
- **Modern UI/UX**: Responsive design with dark/light themes
- **Performance**: Redis caching, database optimization
- **Security**: Rate limiting, input validation, audit logs
- **Monitoring**: Error tracking, performance monitoring
- **Scalability**: Horizontal scaling support

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database ORM**: Drizzle ORM
- **Validation**: Zod schemas

### Database & Cache
- **Primary Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Search**: PostgreSQL Full-text Search
- **File Storage**: ImageKit

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2 (production)
- **Monitoring**: Sentry, Winston logging

### Testing
- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **API Testing**: Supertest
- **Coverage**: c8

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/amhsj-platform.git
   cd amhsj-platform
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/amhsj"
   
   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Redis
   REDIS_URL="redis://localhost:6379"
   
   # Email
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   
   # File Storage
   IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
   IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
   IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"
   
   # External Services
   DOI_PREFIX="10.1234"
   CROSSREF_USERNAME="your-crossref-username"
   CROSSREF_PASSWORD="your-crossref-password"
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb amhsj
   
   # Run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   
   # Create admin user
   npm run create-admin
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Docker Setup

1. **Using Docker Compose**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with production values
   
   # Start all services
   docker-compose up -d
   
   # Run initial setup
   docker-compose exec app npm run migrate
   docker-compose exec app npm run seed
   docker-compose exec app npm run create-admin
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes | - |
| `NEXTAUTH_URL` | Application base URL | Yes | - |
| `SMTP_HOST` | Email SMTP host | Yes | - |
| `SMTP_PORT` | Email SMTP port | Yes | 587 |
| `SMTP_USER` | Email username | Yes | - |
| `SMTP_PASS` | Email password | Yes | - |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | Yes | - |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | Yes | - |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | Yes | - |
| `DOI_PREFIX` | DOI prefix for articles | No | - |
| `SENTRY_DSN` | Sentry error tracking DSN | No | - |
| `ENABLE_MONITORING` | Enable monitoring features | No | true |

### Feature Flags

Control platform features through environment variables:

```env
# Core Features
ENABLE_REAL_TIME_NOTIFICATIONS=true
ENABLE_ADVANCED_SEARCH=true
ENABLE_DOI_GENERATION=true
ENABLE_PEER_REVIEW_AUTOMATION=true

# Integration Features
ENABLE_ORCID_INTEGRATION=true
ENABLE_CROSSREF_INTEGRATION=true
ENABLE_PLAGIARISM_CHECK=false

# Development Features
ENABLE_DEBUG_MODE=false
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_EMAIL_TESTING=false
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks

# Database
npm run migrate          # Run database migrations
npm run seed             # Seed database with initial data
npm run create-admin     # Create admin user
npm run backup           # Create database backup

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:integration # Run integration tests

# Utilities
npm run clean            # Clean build artifacts
npm run generate-types   # Generate TypeScript types
npm run check-deps       # Check for outdated dependencies
```

### Development Workflow

1. **Branch Naming Convention**
   - `feature/` - New features
   - `bugfix/` - Bug fixes
   - `hotfix/` - Critical fixes
   - `refactor/` - Code refactoring

2. **Commit Message Format**
   ```
   type(scope): description
   
   Examples:
   feat(auth): add ORCID integration
   fix(api): resolve rate limiting issue
   docs(readme): update installation guide
   ```

3. **Code Quality**
   - ESLint configuration for code linting
   - Prettier for code formatting
   - Husky for pre-commit hooks
   - TypeScript for type safety

### Database Migrations

```bash
# Create new migration
npm run db:generate

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback

# Reset database
npm run db:reset
```

## 🧪 Testing

### Test Structure

```
__tests__/
├── api/                 # API route tests
├── components/          # Component tests
├── integration/         # Integration tests
├── lib/                # Library function tests
└── e2e/                # End-to-end tests
```

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration

# All tests
npm run test:all
```

### Test Configuration

- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright with multiple browsers
- **API Tests**: Supertest for API endpoint testing
- **Coverage**: c8 for coverage reporting

## 🚀 Deployment

### Production Deployment

#### Docker Deployment (Recommended)

1. **Prepare Environment**
   ```bash
   # Copy and configure environment
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Build and Deploy**
   ```bash
   # Build images
   docker-compose -f docker-compose.prod.yml build
   
   # Start services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Run initial setup
   docker-compose -f docker-compose.prod.yml exec app npm run migrate
   docker-compose -f docker-compose.prod.yml exec app npm run seed
   ```

3. **SSL Configuration**
   - Place SSL certificates in `./ssl/` directory
   - Update `nginx.conf` with your domain
   - Restart Nginx: `docker-compose restart nginx`

#### Manual Deployment

1. **Build Application**
   ```bash
   npm ci --production
   npm run build
   ```

2. **Setup Process Manager**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start ecosystem.config.js
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

### Environment-Specific Configurations

#### Development
- Hot reloading enabled
- Detailed error messages
- Debug logging
- Test data seeding

#### Staging
- Production-like environment
- Error tracking enabled
- Performance monitoring
- Test data isolation

#### Production
- Optimized builds
- Error tracking
- Performance monitoring
- Security hardening
- Backup automation

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Log rotation configured

## 📚 API Documentation

### Authentication Endpoints

```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/verify-email
POST /api/auth/reset-password
```

### Article Management

```typescript
GET    /api/articles           # List articles
POST   /api/articles           # Create article
GET    /api/articles/[id]      # Get article
PUT    /api/articles/[id]      # Update article
DELETE /api/articles/[id]      # Delete article
```

### Review System

```typescript
GET  /api/reviews              # List reviews
POST /api/reviews              # Create review
GET  /api/reviews/[id]         # Get review
PUT  /api/reviews/[id]         # Update review
POST /api/reviews/[id]/submit  # Submit review
```

### User Management

```typescript
GET  /api/users                # List users (admin)
GET  /api/users/[id]           # Get user profile
PUT  /api/users/[id]           # Update user
GET  /api/users/[id]/stats     # User statistics
```

### Admin Endpoints

```typescript
GET  /api/admin/stats          # Platform statistics
GET  /api/admin/users          # User management
GET  /api/admin/articles       # Article management
POST /api/admin/applications   # Application reviews
```

### Integration Endpoints

```typescript
POST /api/integrations/crossref    # DOI registration
GET  /api/integrations/orcid       # ORCID profile
POST /api/integrations/plagiarism  # Plagiarism check
```

## 🏗 Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Load Balancer │    │   CDN/Cache     │
│  (Web/Mobile)   │◄──►│     (Nginx)     │◄──►│   (CloudFlare)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │  Next.js App    │
                       │  (App Router)   │
                       └─────────────────┘
                                │
                    ┌──────────────────────┐
                    │                      │
            ┌─────────────────┐    ┌─────────────────┐
            │   PostgreSQL    │    │     Redis       │
            │   (Primary DB)  │    │    (Cache)      │
            └─────────────────┘    └─────────────────┘
                    │
            ┌─────────────────┐
            │  External APIs  │
            │ (ORCID, CrossRef│
            │  ImageKit, etc) │
            └─────────────────┘
```

### Database Schema

#### Core Tables

```sql
-- Users and Authentication
users (id, email, name, role, password, orcid, affiliation)
user_sessions (id, user_id, token, expires_at)
user_applications (id, user_id, requested_role, status)

-- Article Management
articles (id, title, abstract, keywords, status, doi, author_id)
article_authors (article_id, user_id, role, order)
article_files (id, article_id, file_url, file_type)

-- Review System
reviews (id, article_id, reviewer_id, recommendation, rating)
review_comments (id, review_id, comment, is_confidential)

-- Workflow & Notifications
workflow_steps (id, article_id, step_type, status, assigned_to)
notifications (id, user_id, title, message, type, is_read)

-- Analytics & Logging
analytics_events (id, user_id, event_type, metadata, timestamp)
audit_logs (id, user_id, action, resource, timestamp)
```

### Application Layers

#### Presentation Layer
- **React Components**: Reusable UI components
- **Pages**: Next.js app router pages
- **Layouts**: Shared layout components
- **Hooks**: Custom React hooks

#### Business Logic Layer
- **Services**: Business logic implementation
- **Utils**: Utility functions
- **Validators**: Input validation schemas
- **Workflows**: Editorial workflow management

#### Data Access Layer
- **ORM**: Drizzle ORM with PostgreSQL
- **Cache**: Redis for performance
- **File Storage**: ImageKit integration
- **External APIs**: Third-party integrations

#### Infrastructure Layer
- **Security**: Authentication, authorization, rate limiting
- **Monitoring**: Error tracking, performance monitoring
- **Logging**: Application and access logs
- **Deployment**: Docker, CI/CD pipelines

## 🔒 Security

### Security Measures

#### Authentication & Authorization
- **NextAuth.js**: Secure authentication with JWT
- **Role-based Access Control**: Fine-grained permissions
- **Session Management**: Secure session handling
- **Password Security**: bcrypt hashing with salt

#### Input Validation & Sanitization
- **Zod Schemas**: Runtime type validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **File Upload Security**: Type and size validation

#### Network Security
- **HTTPS Enforcement**: SSL/TLS encryption
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Rate Limiting**: Request throttling
- **CORS Configuration**: Cross-origin resource sharing

#### Data Protection
- **Encryption**: Sensitive data encryption
- **Audit Logging**: Security event tracking
- **Data Backup**: Regular automated backups
- **Privacy Compliance**: GDPR compliance features

### Security Configuration

```nginx
# Security Headers (nginx.conf)
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'";
```

### Security Checklist

- [ ] HTTPS enabled with valid certificates
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection active
- [ ] File upload restrictions
- [ ] Error message sanitization
- [ ] Audit logging enabled
- [ ] Regular security updates
- [ ] Penetration testing completed

## 📊 Monitoring

### Application Monitoring

#### Error Tracking
- **Sentry Integration**: Real-time error tracking
- **Error Boundaries**: React error boundary components
- **API Error Handling**: Comprehensive error responses
- **Log Aggregation**: Centralized logging with Winston

#### Performance Monitoring
- **Core Web Vitals**: Page load performance
- **API Response Times**: Endpoint performance tracking
- **Database Query Performance**: Slow query identification
- **Memory Usage**: Application memory monitoring

#### Business Metrics
- **User Analytics**: Registration, login, activity metrics
- **Article Metrics**: Submission, review, publication stats
- **System Health**: Database, cache, external service status
- **Custom Events**: Business-specific event tracking

### Monitoring Setup

```typescript
// Sentry Configuration
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// Performance Monitoring
import { Analytics } from "@/lib/analytics"

Analytics.track("article_submitted", {
  userId: user.id,
  articleId: article.id,
  category: article.category,
})
```

### Health Check Endpoint

```typescript
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy"
  }
}
```

## 🤝 Contributing

### Development Setup

1. **Fork & Clone**
   ```bash
   git fork https://github.com/your-org/amhsj-platform.git
   git clone https://github.com/your-username/amhsj-platform.git
   cd amhsj-platform
   ```

2. **Setup Development Environment**
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Contribution Guidelines

- Follow the existing code style and conventions
- Write tests for new features and bug fixes
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Use conventional commit messages

### Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure CI pipeline passes
4. Request review from maintainers
5. Address review feedback
6. Merge after approval

### Code Style

- **ESLint**: Follow configured linting rules
- **Prettier**: Use for code formatting
- **TypeScript**: Maintain type safety
- **Comments**: Document complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- **Issues**: [GitHub Issues](https://github.com/your-org/amhsj-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/amhsj-platform/discussions)
- **Email**: support@amhsj.org

### Emergency Support
For critical production issues:
- **Emergency Email**: emergency@amhsj.org
- **Response Time**: < 2 hours during business hours

---

**AMHSJ Platform** - Advancing Medical Research Through Technology
