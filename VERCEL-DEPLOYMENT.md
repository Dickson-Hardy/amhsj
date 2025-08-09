# AMHSJ Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### One-Click Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/amhsj)

### Manual Deployment Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 📋 Vercel Configuration Checklist

### 1. Environment Variables Setup
Go to your Vercel dashboard → Project Settings → Environment Variables

**Required Variables:**
```bash
# Authentication
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your_secure_secret_key_min_32_chars

# Database (Vercel Postgres)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# Storage (Vercel KV)
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=...

# External APIs
CROSSREF_API_KEY=your_crossref_key
ORCID_CLIENT_ID=your_orcid_id
ORCID_CLIENT_SECRET=your_orcid_secret

# Email (Resend recommended for Vercel)
SMTP_HOST=smtp.resend.com
SMTP_USER=resend
SMTP_PASSWORD=your_resend_api_key
SMTP_FROM=noreply@yourdomain.com

# Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
```

### 2. Vercel Services Setup

#### Vercel Postgres
```bash
# Add Postgres to your project
vercel storage create postgres --name amhsj-db

# Get connection strings
vercel env pull .env.local
```

#### Vercel KV (Redis)
```bash
# Add KV storage
vercel storage create kv --name amhsj-cache

# Environment variables automatically added
```

#### Vercel Blob (File Storage)
```bash
# Add Blob storage
vercel storage create blob --name amhsj-files

# Get upload token
vercel env pull .env.local
```

### 3. Custom Domain Configuration
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

## 🔧 Vercel-Specific Optimizations

### Edge Functions
Your API routes automatically run on Vercel Edge Functions with:
- Global distribution
- 0ms cold starts
- Automatic scaling

### Cron Jobs
Configure scheduled tasks in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Analytics
Enable Vercel Analytics:
```bash
npm install @vercel/analytics
```

Add to your layout:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🔄 Maintenance Mode on Vercel

### Enable Maintenance Mode
```bash
# Set environment variable
vercel env add MAINTENANCE_MODE production
# Enter: true

# Redeploy
vercel --prod
```

### Disable Maintenance Mode
```bash
# Update environment variable
vercel env rm MAINTENANCE_MODE production
# Or set to false

# Redeploy
vercel --prod
```

### Alternative: Branch-based Maintenance
1. Create maintenance branch with maintenance mode enabled
2. Promote maintenance branch to production
3. Switch back to main branch when maintenance is complete

## 📊 Monitoring & Observability

### Vercel Analytics
- Real-time performance metrics
- Core Web Vitals tracking
- User behavior insights

### Error Tracking with Sentry
Add Sentry integration:
```bash
npx @sentry/wizard -i nextjs
```

Configure in `sentry.client.config.js`:
```javascript
import { init } from '@sentry/nextjs'

init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})
```

### Custom Monitoring
Use the `/api/health` endpoint for:
- Uptime monitoring
- Performance tracking
- Service health checks

## 🚦 Deployment Workflow

### Automatic Deployments
1. **Production**: Push to `main` branch
2. **Preview**: Create pull request
3. **Development**: Push to any branch

### Manual Deployments
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --target=production
```

### Environment-Specific Deployments
```bash
# Deploy with specific environment
vercel --prod --env MAINTENANCE_MODE=false
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Build Errors
Check build logs in Vercel dashboard:
```bash
# Local build test
vercel build
```

#### 2. Environment Variables
```bash
# Pull latest environment variables
vercel env pull .env.local

# Check specific variable
vercel env ls
```

#### 3. Database Connection Issues
Verify Postgres connection:
```bash
# Test connection locally
node -e "const { sql } = require('@vercel/postgres'); sql\`SELECT 1\`.then(console.log)"
```

#### 4. Function Timeout
Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Performance Optimization

#### 1. Edge Caching
```typescript
// Add cache headers to API routes
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 's-maxage=86400'
    }
  })
}
```

#### 2. Image Optimization
Next.js Image component automatically optimized on Vercel:
```tsx
import Image from 'next/image'

<Image
  src="/article-image.jpg"
  alt="Article"
  width={800}
  height={600}
  priority
/>
```

#### 3. Bundle Analysis
```bash
# Analyze bundle size
ANALYZE=true npm run build
```

## 🔐 Security Best Practices

### Headers
Vercel automatically adds security headers. Customize in `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  }
}
```

### Rate Limiting
Use Vercel Edge Config for rate limiting:
```typescript
import { kv } from '@vercel/kv'

export async function rateLimit(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  const key = `rate_limit:${ip}`
  
  const current = await kv.incr(key)
  if (current === 1) {
    await kv.expire(key, 60) // 1 minute window
  }
  
  return current <= 100 // 100 requests per minute
}
```

## 📈 Scaling Considerations

### Vercel Limits
- **Hobby Plan**: 100GB bandwidth, 100 serverless functions
- **Pro Plan**: 1TB bandwidth, unlimited functions
- **Enterprise**: Custom limits

### Database Scaling
- Use connection pooling with Prisma
- Consider read replicas for heavy read workloads
- Monitor connection limits

### File Storage Scaling
- Vercel Blob auto-scales
- Consider CDN for static assets
- Implement file compression

---

**Need Help?**
- Vercel Documentation: https://vercel.com/docs
- AMHSJ Support: support@amhsj.org
- Community: https://github.com/vercel/vercel/discussions

Last Updated: August 8, 2025
