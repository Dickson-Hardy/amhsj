# 📋 Daily Implementation Tasks - Completion Plan

## 🗓️ Week 1: Academic Standards & Core Integrations

### **Day 1: DOI Service Implementation**

#### **Morning Tasks (4 hours)**
**File**: `lib/doi.ts` - Complete DOI generation service

```typescript
// Replace existing placeholder with production implementation
export class DOIGenerator {
  private static readonly DOI_PREFIX = process.env.DOI_PREFIX || "10.1234"
  private static readonly JOURNAL_CODE = "amhsj"
  private static readonly CROSSREF_API_URL = "https://api.crossref.org/works"
  
  static async registerWithCrossRef(doi: string, metadata: DOIMetadata): Promise<boolean> {
    try {
      const crossRefData = this.formatCrossRefMetadata(doi, metadata)
      
      const response = await fetch(this.CROSSREF_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CROSSREF_API_KEY}`,
          "User-Agent": "AMHSJ/1.0 (mailto:admin@amhsj.org)"
        },
        body: JSON.stringify(crossRefData)
      })

      if (response.ok) {
        console.log(`DOI ${doi} registered successfully with CrossRef`)
        return true
      } else {
        const error = await response.text()
        console.error(`CrossRef registration failed: ${error}`)
        return false
      }
    } catch (error) {
      console.error("DOI registration error:", error)
      return false
    }
  }

  private static formatCrossRefMetadata(doi: string, metadata: DOIMetadata) {
    return {
      "message-type": "work",
      "message-version": "1.0.0",
      "message": {
        "indexed": {
          "date-parts": [[new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()]],
          "date-time": new Date().toISOString(),
          "timestamp": Date.now()
        },
        "DOI": doi,
        "type": "journal-article",
        "title": [metadata.title],
        "author": metadata.authors.map(author => ({
          "given": author.given,
          "family": author.family,
          "ORCID": author.orcid || undefined,
          "affiliation": [{ "name": author.affiliation }]
        })),
        "container-title": ["Advancing Modern Hardware & Software Journal"],
        "abstract": metadata.abstract,
        "published-online": {
          "date-parts": [[
            new Date(metadata.publicationDate).getFullYear(),
            new Date(metadata.publicationDate).getMonth() + 1,
            new Date(metadata.publicationDate).getDate()
          ]]
        },
        "volume": metadata.volume,
        "issue": metadata.issue,
        "page": metadata.pages,
        "subject": metadata.keywords
      }
    }
  }
}
```

#### **Afternoon Tasks (4 hours)**
**File**: `app/api/integrations/crossref/route.ts` - API endpoint completion

```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { articleId, metadata } = await request.json()

    // Validate required metadata
    if (!metadata.title || !metadata.authors || !metadata.volume) {
      return NextResponse.json({ 
        error: "Missing required metadata for DOI registration" 
      }, { status: 400 })
    }

    // Generate DOI
    const doi = DOIGenerator.generateDOI({
      year: new Date().getFullYear(),
      volume: metadata.volume,
      issue: metadata.issue,
      articleNumber: metadata.articleNumber,
    })

    // Register with CrossRef
    const registered = await DOIGenerator.registerWithCrossRef(doi, metadata)

    if (registered) {
      // Update article with DOI
      await db
        .update(articles)
        .set({
          doi: doi,
          doiRegistered: true,
          doiRegisteredAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(articles.id, articleId))

      logInfo("DOI registered successfully", { articleId, doi })

      return NextResponse.json({
        success: true,
        doi,
        message: "DOI registered successfully with CrossRef",
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to register DOI with CrossRef",
      }, { status: 500 })
    }
  } catch (error) {
    logError(error as Error, { endpoint: "/api/integrations/crossref" })
    return NextResponse.json({ 
      success: false, 
      error: "DOI registration failed" 
    }, { status: 500 })
  }
}
```

**File**: `app/admin/doi-management/page.tsx` - DOI management interface

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DOIManagementPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const handleDOIRegistration = async (articleId: string) => {
    try {
      const response = await fetch("/api/integrations/crossref", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId })
      })
      
      if (response.ok) {
        // Refresh articles list
        fetchArticles()
      }
    } catch (error) {
      console.error("DOI registration failed:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">DOI Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Published Articles - DOI Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>DOI</TableHead>
                <TableHead>CrossRef Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{article.doi || "Not assigned"}</TableCell>
                  <TableCell>
                    {article.doiRegistered ? (
                      <Badge className="bg-green-100 text-green-800">Registered</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!article.doiRegistered && (
                      <Button 
                        size="sm" 
                        onClick={() => handleDOIRegistration(article.id)}
                      >
                        Register DOI
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### **Day 2: DOI Integration Completion**

#### **Morning Tasks (4 hours)**
**Database Migration**: Add DOI fields to articles table

```sql
-- File: scripts/add-doi-fields.sql
ALTER TABLE articles 
ADD COLUMN doi VARCHAR(255) UNIQUE,
ADD COLUMN doi_registered BOOLEAN DEFAULT FALSE,
ADD COLUMN doi_registered_at TIMESTAMP,
ADD COLUMN crossref_metadata JSONB;

CREATE INDEX idx_articles_doi ON articles(doi);
CREATE INDEX idx_articles_doi_registered ON articles(doi_registered);
```

**File**: `lib/db/schema.ts` - Update schema

```typescript
export const articles = pgTable("articles", {
  // ... existing fields
  doi: varchar("doi", { length: 255 }),
  doiRegistered: boolean("doi_registered").default(false),
  doiRegisteredAt: timestamp("doi_registered_at"),
  crossrefMetadata: jsonb("crossref_metadata"),
})
```

#### **Afternoon Tasks (4 hours)**
**File**: `components/article-doi-display.tsx` - DOI display component

```typescript
interface DOIDisplayProps {
  doi?: string
  title: string
}

export function DOIDisplay({ doi, title }: DOIDisplayProps) {
  if (!doi) return null

  const doiUrl = `https://doi.org/${doi}`
  
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <span className="font-medium">DOI:</span>
      <a 
        href={doiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {doi}
      </a>
      <Button 
        size="sm" 
        variant="outline"
        onClick={() => navigator.clipboard.writeText(doiUrl)}
      >
        Copy DOI
      </Button>
    </div>
  )
}
```

**Tests**: `__tests__/doi.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { DOIGenerator } from '../lib/doi'

describe('DOI Generator', () => {
  it('should generate valid DOI format', () => {
    const doi = DOIGenerator.generateDOI({
      year: 2025,
      volume: "1",
      issue: "1", 
      articleNumber: 1
    })
    
    expect(doi).toMatch(/^10\.\d{4}\/amhsj\.\d{4}\.\d+\.\d+\.\d{3}$/)
  })

  it('should format CrossRef metadata correctly', async () => {
    const metadata = {
      title: "Test Article",
      authors: [{ given: "John", family: "Doe", affiliation: "Test University" }],
      abstract: "Test abstract",
      publicationDate: "2025-01-01",
      volume: "1",
      issue: "1",
      pages: "1-10",
      keywords: ["test", "research"]
    }
    
    // Test the formatCrossRefMetadata method
    const result = await DOIGenerator.registerWithCrossRef("10.1234/test", metadata)
    expect(result).toBeDefined()
  })
})
```

---

### **Day 3: ORCID Integration Start**

#### **Morning Tasks (4 hours)**
**File**: `lib/orcid.ts` - ORCID service implementation

```typescript
export class ORCIDService {
  private static readonly ORCID_API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.orcid.org/v3.0' 
    : 'https://api.sandbox.orcid.org/v3.0'
  
  private static readonly CLIENT_ID = process.env.ORCID_CLIENT_ID
  private static readonly CLIENT_SECRET = process.env.ORCID_CLIENT_SECRET
  private static readonly REDIRECT_URI = process.env.ORCID_REDIRECT_URI

  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID!,
      response_type: 'code',
      scope: '/authenticate /read-limited',
      redirect_uri: this.REDIRECT_URI!,
      state: state
    })
    
    return `https://orcid.org/oauth/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(code: string): Promise<ORCIDTokenResponse | null> {
    try {
      const response = await fetch('https://orcid.org/oauth/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.CLIENT_ID!,
          client_secret: this.CLIENT_SECRET!,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.REDIRECT_URI!
        })
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('ORCID token exchange error:', error)
      return null
    }
  }

  static async getProfile(orcidId: string, accessToken: string): Promise<ORCIDProfile | null> {
    try {
      const response = await fetch(`${this.ORCID_API_URL}/${orcidId}/person`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return this.formatORCIDProfile(data)
      }
      
      return null
    } catch (error) {
      console.error('ORCID profile fetch error:', error)
      return null
    }
  }

  static async getWorks(orcidId: string, accessToken: string): Promise<ORCIDWork[] | null> {
    try {
      const response = await fetch(`${this.ORCID_API_URL}/${orcidId}/works`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return this.formatORCIDWorks(data)
      }
      
      return null
    } catch (error) {
      console.error('ORCID works fetch error:', error)
      return null
    }
  }

  private static formatORCIDProfile(data: any): ORCIDProfile {
    return {
      orcidId: data['orcid-identifier']?.path,
      name: {
        given: data.name?.['given-names']?.value,
        family: data.name?.['family-name']?.value
      },
      biography: data.biography?.content,
      affiliations: data['employment-summary']?.['employment-summary']?.map((emp: any) => ({
        organization: emp.organization?.name,
        role: emp['role-title'],
        startDate: emp['start-date'],
        endDate: emp['end-date']
      })) || [],
      verified: true
    }
  }

  private static formatORCIDWorks(data: any): ORCIDWork[] {
    return data.group?.map((group: any) => {
      const workSummary = group['work-summary']?.[0]
      return {
        title: workSummary?.title?.title?.value,
        journal: workSummary?.['journal-title']?.value,
        year: workSummary?.['publication-date']?.year?.value,
        type: workSummary?.type,
        url: workSummary?.url?.value
      }
    }) || []
  }
}

export interface ORCIDTokenResponse {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  scope: string
  orcid: string
}

export interface ORCIDProfile {
  orcidId: string
  name: {
    given: string
    family: string
  }
  biography?: string
  affiliations: Array<{
    organization: string
    role: string
    startDate?: any
    endDate?: any
  }>
  verified: boolean
}

export interface ORCIDWork {
  title: string
  journal?: string
  year?: string
  type: string
  url?: string
}
```

#### **Afternoon Tasks (4 hours)**
**File**: `app/api/auth/orcid/callback/route.ts` - ORCID OAuth callback

```typescript
import { NextRequest, NextResponse } from "next/server"
import { ORCIDService } from "@/lib/orcid"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    if (!code) {
      return NextResponse.redirect('/dashboard?error=orcid_auth_failed')
    }

    // Exchange code for token
    const tokenResponse = await ORCIDService.exchangeCodeForToken(code)
    if (!tokenResponse) {
      return NextResponse.redirect('/dashboard?error=orcid_token_failed')
    }

    // Get user profile
    const profile = await ORCIDService.getProfile(tokenResponse.orcid, tokenResponse.access_token)
    if (!profile) {
      return NextResponse.redirect('/dashboard?error=orcid_profile_failed')
    }

    // Get current user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect('/auth/login?error=session_required')
    }

    // Update user with ORCID data
    await db
      .update(users)
      .set({
        orcid: profile.orcidId,
        orcidVerified: true,
        orcidData: profile,
        orcidAccessToken: tokenResponse.access_token,
        orcidRefreshToken: tokenResponse.refresh_token,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    // Import publications if available
    const works = await ORCIDService.getWorks(profile.orcidId, tokenResponse.access_token)
    if (works) {
      // Store works in user publications table
      // Implementation depends on your publications schema
    }

    return NextResponse.redirect('/dashboard?success=orcid_connected')
  } catch (error) {
    console.error('ORCID callback error:', error)
    return NextResponse.redirect('/dashboard?error=orcid_callback_failed')
  }
}
```

---

### **Day 4: ORCID Integration Completion**

#### **Morning Tasks (4 hours)**
**File**: `components/orcid-integration.tsx` - ORCID integration component

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

interface ORCIDIntegrationProps {
  user: {
    orcid?: string
    orcidVerified?: boolean
    orcidData?: any
  }
}

export function ORCIDIntegration({ user }: ORCIDIntegrationProps) {
  const [loading, setLoading] = useState(false)

  const handleORCIDConnect = async () => {
    setLoading(true)
    try {
      // Generate state parameter for security
      const state = crypto.randomUUID()
      sessionStorage.setItem('orcid_state', state)
      
      // Get authorization URL
      const response = await fetch('/api/auth/orcid/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      })
      
      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (error) {
      console.error('ORCID connection error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleORCIDDisconnect = async () => {
    try {
      const response = await fetch('/api/auth/orcid/disconnect', {
        method: 'POST'
      })
      
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('ORCID disconnection error:', error)
    }
  }

  if (user.orcid && user.orcidVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ORCID Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user.orcidData?.name?.given} {user.orcidData?.name?.family}</p>
              <p className="text-sm text-gray-600">ORCID ID: {user.orcid}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Verified</Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://orcid.org/${user.orcid}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View ORCID Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleORCIDDisconnect}
            >
              Disconnect
            </Button>
          </div>

          {user.orcidData?.affiliations?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Affiliations</h4>
              <div className="space-y-1">
                {user.orcidData.affiliations.map((affiliation: any, index: number) => (
                  <p key={index} className="text-sm text-gray-600">
                    {affiliation.role} at {affiliation.organization}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          Connect Your ORCID
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Connect your ORCID iD to automatically populate your profile and publication list.
        </p>
        
        <Button 
          onClick={handleORCIDConnect}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Connecting..." : "Connect ORCID"}
        </Button>
        
        <div className="text-xs text-gray-500">
          <p>• Automatically sync your publications</p>
          <p>• Verify your identity as an author</p>
          <p>• Improve discoverability of your work</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### **Afternoon Tasks (4 hours)**
**Database Migration**: Add ORCID fields

```sql
-- File: scripts/add-orcid-fields.sql
ALTER TABLE users 
ADD COLUMN orcid VARCHAR(255),
ADD COLUMN orcid_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN orcid_data JSONB,
ADD COLUMN orcid_access_token TEXT,
ADD COLUMN orcid_refresh_token TEXT;

CREATE INDEX idx_users_orcid ON users(orcid);
CREATE INDEX idx_users_orcid_verified ON users(orcid_verified);
```

**File**: `app/api/auth/orcid/authorize/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { ORCIDService } from "@/lib/orcid"

export async function POST(request: NextRequest) {
  try {
    const { state } = await request.json()
    
    const authUrl = ORCIDService.getAuthorizationUrl(state)
    
    return NextResponse.json({ authUrl })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate ORCID auth URL" }, { status: 500 })
  }
}
```

---

### **Day 5: Plagiarism Detection Service**

#### **Morning Tasks (4 hours)**
**Research and Setup**: Choose plagiarism detection service
- Evaluate: Turnitin iThenticate, Copyscape API, or PlagiarismCheck API
- Set up API credentials and test access
- Review pricing and implementation requirements

**File**: `lib/plagiarism.ts` - Plagiarism service implementation

```typescript
export class PlagiarismService {
  private static readonly API_URL = process.env.PLAGIARISM_API_URL!
  private static readonly API_KEY = process.env.PLAGIARISM_API_KEY!
  
  static async checkDocument(text: string, fileName: string): Promise<PlagiarismResult> {
    try {
      // Example implementation for iThenticate API
      const response = await fetch(`${this.API_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          owner: process.env.ITHENTICATE_OWNER_ID,
          title: fileName,
          submitter: 'AMHSJ System',
          content: text,
          settings: {
            exclude_quotes: true,
            exclude_bibliography: true,
            exclude_small_matches: true,
            small_match_threshold: 5
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Plagiarism API error: ${response.statusText}`)
      }

      const submission = await response.json()
      
      // Wait for processing to complete
      const result = await this.waitForCompletion(submission.id)
      
      return {
        submissionId: submission.id,
        similarityScore: result.similarity_score,
        sources: result.sources || [],
        reportUrl: result.report_url,
        status: 'completed',
        processedAt: new Date()
      }
    } catch (error) {
      console.error('Plagiarism check error:', error)
      throw new Error('Plagiarism detection failed')
    }
  }

  private static async waitForCompletion(submissionId: string): Promise<any> {
    const maxAttempts = 30 // 5 minutes max wait
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.API_URL}/submissions/${submissionId}`, {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'COMPLETE') {
            // Get detailed report
            const reportResponse = await fetch(`${this.API_URL}/submissions/${submissionId}/report`, {
              headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
                'Accept': 'application/json'
              }
            })
            
            return await reportResponse.json()
          }
          
          if (data.status === 'ERROR') {
            throw new Error('Plagiarism processing failed')
          }
        }
        
        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000))
        attempts++
      } catch (error) {
        console.error('Error checking plagiarism status:', error)
        attempts++
      }
    }
    
    throw new Error('Plagiarism check timeout')
  }

  static async getReport(submissionId: string): Promise<PlagiarismReport | null> {
    try {
      const response = await fetch(`${this.API_URL}/submissions/${submissionId}/report`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const report = await response.json()
        return this.formatReport(report)
      }
      
      return null
    } catch (error) {
      console.error('Error fetching plagiarism report:', error)
      return null
    }
  }

  private static formatReport(report: any): PlagiarismReport {
    return {
      similarityScore: report.similarity_score,
      sources: report.sources?.map((source: any) => ({
        title: source.title,
        url: source.url,
        similarity: source.similarity_percentage,
        matchedText: source.matched_text,
        sourceType: source.source_type
      })) || [],
      summary: report.summary,
      reportUrl: report.viewer_url,
      generatedAt: new Date(report.generated_time)
    }
  }
}

export interface PlagiarismResult {
  submissionId: string
  similarityScore: number
  sources: PlagiarismSource[]
  reportUrl: string
  status: 'processing' | 'completed' | 'error'
  processedAt: Date
}

export interface PlagiarismSource {
  title: string
  url: string
  similarity: string
  matchedText: string
  sourceType: string
}

export interface PlagiarismReport {
  similarityScore: number
  sources: PlagiarismSource[]
  summary: string
  reportUrl: string
  generatedAt: Date
}
```

#### **Afternoon Tasks (4 hours)**
**File**: `app/api/plagiarism/check/route.ts` - Update with real implementation

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PlagiarismService } from "@/lib/plagiarism"
import { db } from "@/lib/db"
import { articles, plagiarismChecks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { logError, logInfo } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["admin", "editor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { articleId, text, fileName } = await request.json()

    if (!text || !articleId) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Check if article exists
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId)
    })

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Start plagiarism check
    logInfo("Starting plagiarism check", { articleId, fileName })
    
    const result = await PlagiarismService.checkDocument(
      text, 
      fileName || `${article.title}.txt`
    )

    // Store result in database
    await db.insert(plagiarismChecks).values({
      id: crypto.randomUUID(),
      articleId: articleId,
      submissionId: result.submissionId,
      similarityScore: result.similarityScore,
      sources: result.sources,
      reportUrl: result.reportUrl,
      status: result.status,
      checkedBy: session.user.id,
      createdAt: new Date()
    })

    // Update article with plagiarism status
    await db
      .update(articles)
      .set({
        plagiarismChecked: true,
        plagiarismScore: result.similarityScore,
        plagiarismStatus: result.similarityScore > 25 ? 'high' : result.similarityScore > 10 ? 'medium' : 'low',
        updatedAt: new Date()
      })
      .where(eq(articles.id, articleId))

    logInfo("Plagiarism check completed", { 
      articleId, 
      similarityScore: result.similarityScore,
      status: result.status 
    })

    return NextResponse.json({
      success: true,
      result: {
        similarityScore: result.similarityScore,
        sources: result.sources,
        reportUrl: result.reportUrl,
        status: result.status,
        submissionId: result.submissionId
      }
    })
  } catch (error) {
    logError(error as Error, { endpoint: "/api/plagiarism/check" })
    return NextResponse.json({ 
      success: false, 
      error: "Plagiarism check failed" 
    }, { status: 500 })
  }
}
```

**Database Migration**: Add plagiarism tracking

```sql
-- File: scripts/add-plagiarism-tables.sql
CREATE TABLE plagiarism_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  submission_id VARCHAR(255) NOT NULL,
  similarity_score INTEGER NOT NULL,
  sources JSONB,
  report_url TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  checked_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE articles 
ADD COLUMN plagiarism_checked BOOLEAN DEFAULT FALSE,
ADD COLUMN plagiarism_score INTEGER,
ADD COLUMN plagiarism_status VARCHAR(20);

CREATE INDEX idx_plagiarism_checks_article_id ON plagiarism_checks(article_id);
CREATE INDEX idx_plagiarism_checks_status ON plagiarism_checks(status);
CREATE INDEX idx_articles_plagiarism_status ON articles(plagiarism_status);
```

Continue with remaining days in next response due to length limits...
