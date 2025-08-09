# AMHSJ - Advances in Medicine and Health Sciences Journal

## 🎯 Project Overview

AMHSJ is a comprehensive, production-ready academic journal publishing platform specifically designed for medical and health sciences research. The platform facilitates the complete scholarly publishing workflow from submission to publication, with focus on clinical research, public health, biomedical sciences, and healthcare innovation.

### 🌟 Key Features

- **Complete Editorial Workflow**: Automated peer review process with reviewer assignment and decision tracking
- **Medical Research Focus**: Specialized categories and features for clinical research, public health, and biomedical sciences
- **Real-time Notifications**: In-app and email notifications for all workflow events
- **Advanced Search**: Full-text search with filtering, suggestions, and analytics
- **Academic Standards**: DOI generation, ORCID integration, and metadata management
- **Admin Dashboard**: Comprehensive management tools for users, articles, and journal operations
- **Performance Optimized**: Redis caching, database indexing, and CDN-ready architecture
- **Security Hardened**: Rate limiting, input validation, and comprehensive error handling

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- React Query for state management

**Backend:**
- Next.js API Routes
- NextAuth.js for authentication
- Drizzle ORM with PostgreSQL
- Redis for caching and rate limiting

**Infrastructure:**
- Docker containerization
- Nginx reverse proxy
- PostgreSQL database
- Redis cache
- ImageKit for file management

**Monitoring & Analytics:**
- Sentry for error tracking
- Winston for logging
- Custom analytics dashboard

### Database Schema

\`\`\`sql
-- Core Tables
users (id, email, name, role, affiliation, orcid, expertise)
articles (id, title, abstract, keywords, category, status, doi, author_id)
reviews (id, article_id, reviewer_id, recommendation, comments, rating)
notifications (id, user_id, title, message, type, is_read)

-- Indexes for Performance
idx_articles_status, idx_articles_category, idx_articles_published_date
idx_articles_search (full-text), idx_reviews_article_id, idx_notifications_user_id
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 15+
- Redis 7+
- ImageKit account (for file management)

### Installation

1. **Clone the repository:**
\`\`\`bash
git clone https://github.com/your-org/amhsj-platform.git
cd amhsj-platform
\`\`\`

2. **Install dependencies:**
\`\`\`bash
npm install
\`\`\`

3. **Environment setup:**
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your configuration
\`\`\`

4. **Database setup:**
\`\`\`bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed

# Create admin user
npm run create-admin
\`\`\`

5. **Start development server:**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the platform.

### Production Deployment

#### Docker Deployment

1. **Build and run with Docker Compose:**
\`\`\`bash
docker-compose up -d
\`\`\`

2. **SSL Configuration:**
- Place SSL certificates in `./ssl/` directory
- Update `nginx.conf` with your domain

#### Manual Deployment

1. **Build the application:**
\`\`\`bash
npm run build
\`\`\`

2. **Run deployment script:**
\`\`\`bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
\`\`\`

## 📊 Features Deep Dive

### Editorial Workflow System

The platform implements a complete academic publishing workflow:

1. **Article Submission**
   - Multi-step submission form with validation
   - File upload with ImageKit integration
   - Automatic email confirmations
   - Metadata extraction and DOI generation

2. **Peer Review Process**
   - Automated reviewer assignment based on expertise
   - Review deadline tracking and reminders
   - Conflict of interest management
   - Anonymous review system

3. **Editorial Decisions**
   - Accept/Reject/Revision workflow
   - Automated status notifications
   - Version control for revisions
   - Publication scheduling

### Medical Research Specialization

- **Dedicated Categories**: Clinical Medicine & Patient Care, Public Health & Epidemiology, Biomedical Sciences & Research, Healthcare Technology & Innovation, Medical Education & Training, Global Health & Policy, Preventive Medicine & Wellness, Medical Ethics & Healthcare Law
- **Medical-specific Metadata**: Study types, patient demographics, treatment protocols
- **Connected Research**: Cross-referencing related medical studies
- **Industry Partnerships**: Integration with healthcare industry standards

### Advanced Search & Analytics

- **Full-text Search**: Title, abstract, keywords, and content
- **Smart Filtering**: Category, year, author, institution
- **Search Suggestions**: Real-time autocomplete
- **Analytics Dashboard**: Usage statistics, impact metrics
- **Citation Tracking**: Integration with academic databases

### Security & Performance

- **Rate Limiting**: API and authentication endpoints
- **Input Validation**: Zod schemas for all forms
- **Error Handling**: Comprehensive error boundaries
- **Caching Strategy**: Redis for frequently accessed data
- **Database Optimization**: Indexes and query optimization

## 🧪 Testing

### Test Suite Coverage

- **Unit Tests**: Core business logic and utilities
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows with Playwright
- **Performance Tests**: Load testing and optimization

### Running Tests

\`\`\`bash
# Unit and integration tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
\`\`\`

## 📈 Monitoring & Maintenance

### Application Monitoring

- **Error Tracking**: Sentry integration for production errors
- **Performance Monitoring**: Response times and database queries
- **User Analytics**: Custom dashboard for journal metrics
- **Uptime Monitoring**: Health checks and alerting

### Database Maintenance

\`\`\`bash
# Create database backup
npm run backup

# Monitor database performance
# Check logs in /logs/ directory
\`\`\`

### Log Management

- **Application Logs**: Winston logger with rotation
- **Access Logs**: Nginx access and error logs
- **Database Logs**: PostgreSQL query and error logs
- **Error Tracking**: Sentry for production error monitoring

## 🔧 Configuration

### Environment Variables

See `.env.example` for complete configuration options:

- **Database**: PostgreSQL connection and credentials
- **Authentication**: NextAuth secrets and OAuth providers
- **File Management**: ImageKit configuration
- **Email**: SMTP settings for notifications
- **Caching**: Redis connection
- **Monitoring**: Sentry and analytics configuration

### Feature Flags

Control platform features through environment variables:

\`\`\`bash
ENABLE_REAL_TIME_NOTIFICATIONS=true
ENABLE_ADVANCED_SEARCH=true
ENABLE_DOI_GENERATION=true
ENABLE_PEER_REVIEW_AUTOMATION=true
\`\`\`

## 🔐 Security

### Security Measures

- **Authentication**: NextAuth.js with multiple providers
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Redis-based request throttling
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries with Drizzle
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Built-in NextAuth CSRF tokens

### Security Headers

\`\`\`nginx
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
