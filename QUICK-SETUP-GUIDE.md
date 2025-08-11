# 🚀 Quick Setup Guide - AMJHS Academic Journal System

## Prerequisites
- Node.js 18+ installed
- Git installed
- PostgreSQL database (Neon Cloud recommended)
- Code editor (VS Code recommended)

---

## 1. Environment Setup

### Clone & Install
```bash
git clone [repository-url]
cd amjhs
pnpm install
```

### Environment Configuration
Create `.env.local`:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

---

## 2. Database Setup

### Run Essential Roles Setup
```bash
npm run setup-roles
```

### Verify Setup
```bash
node scripts/verify-users.cjs
```

**Expected Output**: 11 users created across 4 roles

---

## 3. Start Development

### Run Development Server
```bash
pnpm dev
```

### Access Application
- **Main Site**: http://localhost:3000
- **Login Page**: http://localhost:3000/auth/login

---

## 4. Test Login Credentials

### Quick Test Accounts
| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | `admin@amhsj.org` | `password123` | System management |
| **Editor-in-Chief** | `eic@amhsj.org` | `password123` | Editorial oversight |
| **Reviewer** | `reviewer1@amhsj.org` | `password123` | Manuscript review |
| **Author** | `author1@example.org` | `password123` | Content submission |

---

## 5. Development Workflow

### File Structure
```
app/                    # Next.js App Router
├── api/               # API endpoints
├── auth/              # Authentication pages
├── dashboard/         # Role dashboards
├── admin/             # Admin interface
└── globals.css        # Global styles

components/            # Reusable UI components
lib/                   # Utilities & database
scripts/               # Database setup scripts
```

### Key Commands
```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
npm run setup-roles   # Create essential users
node scripts/verify-users.cjs  # Check database

# Testing
pnpm test             # Run tests
pnpm test:e2e         # Run E2E tests
```

---

## 6. Role-Based Testing

### Admin Testing Flow
1. Login as `admin@amhsj.org`
2. Visit `/admin`
3. Test user management features
4. Check system analytics

### Editor Testing Flow
1. Login as `eic@amhsj.org`
2. Visit `/dashboard`
3. Test manuscript management
4. Check editorial tools

### Reviewer Testing Flow
1. Login as `reviewer1@amhsj.org`
2. Visit `/reviewer`
3. Test review assignment
4. Check evaluation forms

### Author Testing Flow
1. Login as `author1@example.org`
2. Visit `/dashboard`
3. Test manuscript submission
4. Check tracking features

---

## 7. Development Tips

### Database Queries
- Use Drizzle ORM for type safety
- Check `lib/db.ts` for schema
- Use prepared statements for security

### Authentication
- Sessions managed via Next.js middleware
- Role checks in `middleware.ts`
- Protected routes configured per role

### UI Components
- Built with shadcn/ui + Tailwind CSS
- Component library in `/components`
- Consistent design system

### API Development
- RESTful endpoints in `/app/api`
- Role-based authorization
- Error handling middleware

---

## 8. Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
node scripts/check-database.cjs
```

#### Role Constraint Errors
- Database only allows: `admin`, `editor`, `reviewer`, `author`
- Use proper role values in scripts

#### Authentication Issues
- Clear browser cookies
- Check `NEXTAUTH_SECRET` in environment
- Verify session middleware

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
pnpm install
pnpm build
```

### Getting Help
- Check console logs for errors
- Review API response status codes
- Use browser dev tools for debugging
- Check database logs for SQL errors

---

## 9. Production Deployment

### Build Process
```bash
pnpm build
pnpm start
```

### Environment Variables (Production)
```env
DATABASE_URL=your-production-database-url
NEXTAUTH_SECRET=strong-production-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Security Checklist
- [ ] Change default passwords
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database SSL

---

## 10. Documentation References

- **Complete Guide**: `ACADEMIC-JOURNAL-SYSTEM-GUIDE.md`
- **Login Credentials**: `LOGIN-CREDENTIALS.md`
- **Workflow Documentation**: `WORKFLOW-DOCUMENTATION.md`
- **API Documentation**: `docs/API.md`
- **Contributing Guidelines**: `CONTRIBUTING.md`

---

## Development Status ✅

- [x] Database setup with essential roles
- [x] Authentication system
- [x] Role-based dashboards
- [x] User profile management
- [x] Manuscript submission flow
- [x] Review workflow system
- [x] Editorial communication
- [x] ORCID integration
- [x] Security implementation
- [x] Comprehensive documentation

---

**Setup Time**: ~10 minutes  
**Ready for**: Development, Testing, Customization  
**Next Steps**: Feature development, UI customization, testing

**Happy Coding! 🎉**
