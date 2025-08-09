# Contributing Guide

Thank you for your interest in contributing to the AMHSJ (Advances in Medicine and Health Sciences Journal) platform! This guide will help you get started with contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Contribution Types](#contribution-types)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project team at conduct@amhsj.org. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Prerequisites

Before contributing, make sure you have:

- Node.js 18+ installed
- Git installed and configured
- PostgreSQL 15+ for database
- Redis 7+ for caching
- A GitHub account

### Setting Up Development Environment

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/amhsj-platform.git
   cd amhsj-platform
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-org/amhsj-platform.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   ```

5. **Set Up Database**
   ```bash
   # Create database
   createdb amhsj_dev
   
   # Run migrations
   npm run migrate
   
   # Seed test data
   npm run seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Verify Setup**
   ```bash
   # Run tests to ensure everything is working
   npm test
   ```

## Development Process

### Workflow Overview

1. **Check for Existing Issues**: Before starting work, check if there's already an issue for what you want to work on
2. **Create/Claim Issue**: Create a new issue or comment on an existing one to claim it
3. **Create Branch**: Create a feature branch from the main branch
4. **Develop**: Write code following our standards and guidelines
5. **Test**: Ensure all tests pass and add new tests as needed
6. **Document**: Update documentation as necessary
7. **Submit PR**: Create a pull request with clear description
8. **Review**: Address feedback from code review
9. **Merge**: Once approved, your PR will be merged

### Branch Naming Convention

Use descriptive branch names that follow this pattern:

```
<type>/<issue-number>-<short-description>

Examples:
feature/123-add-orcid-integration
bugfix/456-fix-email-validation
hotfix/789-security-patch
docs/321-update-api-documentation
refactor/654-optimize-database-queries
```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add ORCID integration for researchers

Add ability for users to connect their ORCID profile for automatic
publication importing and profile verification.

Closes #123

fix(api): resolve email validation regex issue

The email validation was incorrectly rejecting valid emails with
subdomains. Updated regex to properly handle all valid email formats.

Fixes #456

docs(readme): update installation instructions

Added Docker setup instructions and troubleshooting section.
```

## Contribution Types

### Code Contributions

#### New Features
- Discuss the feature in an issue first
- Ensure it aligns with project goals
- Include comprehensive tests
- Update documentation

#### Bug Fixes
- Reference the issue being fixed
- Include regression tests
- Verify the fix doesn't break existing functionality

#### Performance Improvements
- Include benchmarks showing improvement
- Ensure changes don't affect functionality
- Document any trade-offs

### Documentation Contributions

#### API Documentation
- Keep in sync with code changes
- Include examples for new endpoints
- Update error codes and responses

#### User Documentation
- Write clear, step-by-step instructions
- Include screenshots where helpful
- Test instructions on fresh environment

#### Developer Documentation
- Update architecture docs for structural changes
- Document new patterns or conventions
- Include rationale for design decisions

### Testing Contributions

#### Unit Tests
- Test individual functions and methods
- Achieve high code coverage
- Test edge cases and error conditions

#### Integration Tests
- Test API endpoints end-to-end
- Test database interactions
- Test external service integrations

#### End-to-End Tests
- Test complete user workflows
- Test critical user paths
- Test across different browsers/devices

## Code Standards

### TypeScript/JavaScript Standards

#### Style Guide

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

async function createUser(userData: CreateUserData): Promise<User> {
  const hashedPassword = await hashPassword(userData.password)
  
  const user = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
  }).returning()
  
  return user[0]
}

// ❌ Bad
interface user {
  id: any
  name: any
  email: any
}

function createUser(data: any) {
  return db.insert(users).values(data)
}
```

#### Naming Conventions

- **Variables and Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types and Interfaces**: PascalCase
- **Files**: kebab-case
- **Directories**: kebab-case

```typescript
// Variables and functions
const userName = "john_doe"
const isAuthenticated = true
function getUserById(id: string) { }

// Constants
const MAX_FILE_SIZE = 25 * 1024 * 1024
const API_ENDPOINTS = {
  USERS: '/api/users',
  ARTICLES: '/api/articles'
}

// Types and interfaces
interface UserProfile {
  id: string
  name: string
}

type UserRole = 'admin' | 'editor' | 'reviewer' | 'author'

// Files
user-profile.tsx
article-management.ts
email-service.ts

// Directories
user-management/
article-submission/
peer-review/
```

#### Code Organization

```typescript
// 1. External imports first
import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 2. Internal imports
import { db } from '@/lib/db'
import { getServerSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

// 3. Type definitions
interface CreateArticleData {
  title: string
  abstract: string
  keywords: string[]
}

// 4. Constants
const MAX_KEYWORDS = 10

// 5. Validation schemas
const createArticleSchema = z.object({
  title: z.string().min(10).max(200),
  abstract: z.string().min(100),
  keywords: z.array(z.string()).max(MAX_KEYWORDS)
})

// 6. Main function
export async function POST(request: NextRequest) {
  // Implementation
}
```

### React Component Standards

#### Component Structure

```tsx
// components/article/article-card.tsx
import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    abstract: string
    publishedDate: Date
    category: string
    authors: Array<{ name: string }>
  }
  onClick?: () => void
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const handleClick = () => {
    onClick?.()
  }

  return (
    <div 
      className="rounded-lg border p-6 hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            By {article.authors.map(a => a.name).join(', ')}
          </p>
        </div>
        
        <p className="text-sm line-clamp-3">
          {article.abstract}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {article.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(article.publishedDate)}
          </span>
        </div>
      </div>
    </div>
  )
}
```

#### Hooks

```tsx
// hooks/use-articles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UseArticlesOptions {
  category?: string
  search?: string
}

export function useArticles(options: UseArticlesOptions = {}) {
  return useQuery({
    queryKey: ['articles', options],
    queryFn: () => fetchArticles(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      toast.success('Article created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create article')
      console.error(error)
    }
  })
}
```

### Database Standards

#### Schema Definitions

```typescript
// lib/db/schema.ts
import { pgTable, varchar, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('author'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  abstract: text('abstract').notNull(),
  content: text('content'),
  keywords: text('keywords').array(),
  category: varchar('category', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  authorId: uuid('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

#### Query Patterns

```typescript
// lib/db/queries/articles.ts
import { db } from '@/lib/db'
import { articles, users } from '@/lib/db/schema'
import { eq, and, ilike, desc } from 'drizzle-orm'

export async function getPublishedArticles(options: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const { category, search, limit = 20, offset = 0 } = options
  
  let query = db
    .select({
      id: articles.id,
      title: articles.title,
      abstract: articles.abstract,
      category: articles.category,
      publishedDate: articles.updatedAt,
      author: {
        name: users.name,
        email: users.email,
      }
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.updatedAt))
    .limit(limit)
    .offset(offset)

  if (category) {
    query = query.where(
      and(
        eq(articles.status, 'published'),
        eq(articles.category, category)
      )
    )
  }

  if (search) {
    query = query.where(
      and(
        eq(articles.status, 'published'),
        ilike(articles.title, `%${search}%`)
      )
    )
  }

  return query
}
```

## Testing Guidelines

### Test Structure

```typescript
// __tests__/api/articles.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { testApiRequest } from '../helpers/test-api'
import { createTestUser, createTestArticle, cleanupTestData } from '../helpers/test-data'

describe('/api/articles', () => {
  let testUser: any
  let testArticle: any

  beforeEach(async () => {
    testUser = await createTestUser()
    testArticle = await createTestArticle({ authorId: testUser.id })
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  describe('GET /api/articles', () => {
    test('should return published articles', async () => {
      const response = await testApiRequest.get('/api/articles')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    test('should filter articles by category', async () => {
      const response = await testApiRequest
        .get('/api/articles')
        .query({ category: 'clinical-medicine' })
      
      expect(response.status).toBe(200)
      expect(response.body.data.every(
        (article: any) => article.category === 'clinical-medicine'
      )).toBe(true)
    })

    test('should handle search queries', async () => {
      const response = await testApiRequest
        .get('/api/articles')
        .query({ search: 'test title' })
      
      expect(response.status).toBe(200)
      expect(response.body.data.some(
        (article: any) => article.title.toLowerCase().includes('test title')
      )).toBe(true)
    })
  })

  describe('POST /api/articles', () => {
    test('should create article with valid data', async () => {
      const articleData = {
        title: 'Test Article Title',
        abstract: 'This is a test article abstract with sufficient length to meet requirements.',
        keywords: ['test', 'article', 'medical'],
        category: 'clinical-medicine',
        content: 'This is the main content of the test article with sufficient length.'
      }

      const response = await testApiRequest
        .post('/api/articles')
        .auth(testUser.token)
        .send(articleData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe(articleData.title)
    })

    test('should reject invalid article data', async () => {
      const invalidData = {
        title: 'Short', // Too short
        abstract: 'Short', // Too short
        keywords: [], // No keywords
      }

      const response = await testApiRequest
        .post('/api/articles')
        .auth(testUser.token)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('validation')
    })

    test('should require authentication', async () => {
      const response = await testApiRequest
        .post('/api/articles')
        .send({})

      expect(response.status).toBe(401)
    })
  })
})
```

### Component Testing

```tsx
// __tests__/components/article-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { ArticleCard } from '@/components/article/article-card'

const mockArticle = {
  id: '1',
  title: 'Test Article Title',
  abstract: 'This is a test article abstract.',
  publishedDate: new Date('2024-01-15'),
  category: 'clinical-medicine',
  authors: [
    { name: 'Dr. John Doe' },
    { name: 'Dr. Jane Smith' }
  ]
}

describe('ArticleCard', () => {
  test('renders article information correctly', () => {
    render(<ArticleCard article={mockArticle} />)
    
    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText('This is a test article abstract.')).toBeInTheDocument()
    expect(screen.getByText('By Dr. John Doe, Dr. Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('clinical-medicine')).toBeInTheDocument()
  })

  test('calls onClick when card is clicked', () => {
    const handleClick = vi.fn()
    render(<ArticleCard article={mockArticle} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('generic'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('formats date correctly', () => {
    render(<ArticleCard article={mockArticle} />)
    
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument()
  })
})
```

### E2E Testing

```typescript
// e2e/article-submission.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Article Submission Flow', () => {
  test('author can submit new article', async ({ page }) => {
    // Login as author
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'author@test.com')
    await page.fill('[data-testid="password"]', 'testpassword')
    await page.click('[data-testid="login-button"]')

    // Navigate to submission page
    await page.click('[data-testid="submit-article-button"]')
    await expect(page).toHaveURL('/submit')

    // Fill article form
    await page.fill('[data-testid="title"]', 'Test Article for E2E')
    await page.fill('[data-testid="abstract"]', 'This is a comprehensive test article abstract that meets the minimum length requirements for submission.')
    await page.selectOption('[data-testid="category"]', 'clinical-medicine')
    
    // Add keywords
    await page.fill('[data-testid="keywords"]', 'test,article,clinical')
    
    // Upload manuscript
    await page.setInputFiles('[data-testid="manuscript-upload"]', 'test-files/sample-manuscript.pdf')

    // Submit article
    await page.click('[data-testid="submit-button"]')

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page).toHaveURL('/dashboard')
  })
})
```

## Documentation

### Code Documentation

Use JSDoc comments for functions and classes:

```typescript
/**
 * Creates a new article in the database
 * 
 * @param articleData - The article data to create
 * @param authorId - The ID of the article author
 * @returns Promise that resolves to the created article
 * 
 * @example
 * ```typescript
 * const article = await createArticle({
 *   title: "New Medical Research",
 *   abstract: "This study examines...",
 *   keywords: ["medicine", "research"],
 *   category: "clinical-medicine"
 * }, "user-123")
 * ```
 */
export async function createArticle(
  articleData: CreateArticleData,
  authorId: string
): Promise<Article> {
  // Implementation
}
```

### API Documentation

Update API documentation when adding or modifying endpoints:

```typescript
/**
 * @openapi
 * /api/articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - abstract
 *               - keywords
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 200
 *               abstract:
 *                 type: string
 *                 minLength: 100
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 3
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 */
export async function POST(request: NextRequest) {
  // Implementation
}
```

## Pull Request Process

### Before Submitting

1. **Sync with Upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run Tests**
   ```bash
   npm test
   npm run test:e2e
   npm run lint
   npm run type-check
   ```

3. **Update Documentation**
   - Update README if needed
   - Update API docs for new endpoints
   - Add JSDoc comments for new functions

### PR Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
Closes #123
Related to #456

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Code Review Process

1. **Automated Checks**: CI will run tests, linting, and security checks
2. **Peer Review**: At least one team member will review your code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, your PR will be merged

### Review Criteria

Reviewers will check for:

- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?
- **Testing**: Are there adequate tests?
- **Documentation**: Is the code properly documented?

## Issue Guidelines

### Bug Reports

Use this template for bug reports:

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
What actually happened instead.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- Browser: [e.g. Chrome 91]
- OS: [e.g. macOS 12.0]
- Node.js version: [e.g. 18.17.0]
- App version: [e.g. 1.2.0]

## Additional Context
Add any other context about the problem here.
```

### Feature Requests

Use this template for feature requests:

```markdown
## Feature Description
A clear and concise description of the feature you'd like to see.

## Problem Statement
Describe the problem this feature would solve. Why is this needed?

## Proposed Solution
Describe the solution you'd like in detail.

## Alternative Solutions
Describe any alternative solutions you've considered.

## Additional Context
Add any other context, mockups, or examples about the feature request.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### Issue Labels

We use these labels to categorize issues:

- **Type**: `bug`, `feature`, `enhancement`, `documentation`
- **Priority**: `low`, `medium`, `high`, `critical`
- **Status**: `needs-triage`, `in-progress`, `blocked`, `ready-for-review`
- **Component**: `frontend`, `backend`, `database`, `api`, `docs`
- **Difficulty**: `good-first-issue`, `beginner`, `intermediate`, `advanced`

## Community

### Communication Channels

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Discord**: For real-time chat (invite link in README)
- **Email**: For security issues and private matters

### Getting Help

If you need help:

1. Check existing documentation
2. Search existing issues and discussions
3. Ask in Discord for quick questions
4. Create a GitHub discussion for broader topics
5. Create an issue for bugs or feature requests

### Recognition

We recognize contributors in several ways:

- **Contributors List**: All contributors are listed in the README
- **Release Notes**: Significant contributions are highlighted in release notes
- **Hall of Fame**: Outstanding contributors are featured on our website
- **Swag**: Active contributors receive project merchandise

### Mentorship Program

We offer mentorship for new contributors:

- **Buddy System**: New contributors are paired with experienced ones
- **Good First Issues**: We maintain a list of beginner-friendly issues
- **Office Hours**: Weekly sessions where you can get help and guidance
- **Code Review Training**: Learn how to give and receive effective code reviews

## Thank You

Thank you for contributing to AMHSJ! Your efforts help advance medical research and improve healthcare outcomes worldwide. Every contribution, no matter how small, makes a difference.

For questions about contributing, please reach out to us at contribute@amhsj.org.

---

*This contributing guide is a living document and will be updated as the project evolves. Last updated: January 2024*
