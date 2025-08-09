# 📋 Daily Implementation Tasks - Week 1 Continued & Week 2

## 🗓️ Week 1 Continued: Academic Standards & Core Integrations

### **Day 6: Citation Management System**

#### **Morning Tasks (4 hours)**
**File**: `lib/citations.ts` - Citation service implementation

```typescript
export class CitationService {
  static readonly CITATION_STYLES = {
    APA: 'apa',
    MLA: 'mla', 
    CHICAGO: 'chicago',
    IEEE: 'ieee',
    VANCOUVER: 'vancouver'
  }

  static async generateCitation(article: Article, style: string = 'APA'): Promise<string> {
    try {
      const authors = this.formatAuthors(article.authors, style)
      const year = new Date(article.publishedAt || article.createdAt).getFullYear()
      
      switch (style.toUpperCase()) {
        case 'APA':
          return this.generateAPACitation(article, authors, year)
        case 'MLA':
          return this.generateMLACitation(article, authors, year)
        case 'CHICAGO':
          return this.generateChicagoCitation(article, authors, year)
        case 'IEEE':
          return this.generateIEEECitation(article, authors, year)
        case 'VANCOUVER':
          return this.generateVancouverCitation(article, authors, year)
        default:
          return this.generateAPACitation(article, authors, year)
      }
    } catch (error) {
      console.error('Citation generation error:', error)
      throw new Error('Failed to generate citation')
    }
  }

  private static formatAuthors(authors: any[], style: string): string {
    if (!authors || authors.length === 0) return ""
    
    switch (style.toUpperCase()) {
      case 'APA':
        return this.formatAuthorsAPA(authors)
      case 'MLA':
        return this.formatAuthorsMLA(authors)
      case 'CHICAGO':
        return this.formatAuthorsChicago(authors)
      case 'IEEE':
        return this.formatAuthorsIEEE(authors)
      case 'VANCOUVER':
        return this.formatAuthorsVancouver(authors)
      default:
        return this.formatAuthorsAPA(authors)
    }
  }

  private static formatAuthorsAPA(authors: any[]): string {
    if (authors.length === 1) {
      return `${authors[0].lastName}, ${authors[0].firstName[0]}.`
    } else if (authors.length === 2) {
      return `${authors[0].lastName}, ${authors[0].firstName[0]}., & ${authors[1].lastName}, ${authors[1].firstName[0]}.`
    } else if (authors.length <= 20) {
      const lastAuthor = authors[authors.length - 1]
      const otherAuthors = authors.slice(0, -1)
      const formatted = otherAuthors.map(a => `${a.lastName}, ${a.firstName[0]}.`).join(', ')
      return `${formatted}, & ${lastAuthor.lastName}, ${lastAuthor.firstName[0]}.`
    } else {
      const first19 = authors.slice(0, 19)
      const lastAuthor = authors[authors.length - 1]
      const formatted = first19.map(a => `${a.lastName}, ${a.firstName[0]}.`).join(', ')
      return `${formatted}, ... ${lastAuthor.lastName}, ${lastAuthor.firstName[0]}.`
    }
  }

  private static generateAPACitation(article: any, authors: string, year: number): string {
    const title = article.title
    const journal = "Advancing Modern Hardware & Software Journal"
    const volume = article.volume || "1"
    const issue = article.issue || "1"
    const pages = article.pages || ""
    const doi = article.doi ? ` https://doi.org/${article.doi}` : ""
    
    return `${authors} (${year}). ${title}. *${journal}*, *${volume}*(${issue})${pages ? `, ${pages}` : ""}.${doi}`
  }

  private static generateMLACitation(article: any, authors: string, year: number): string {
    const title = `"${article.title}"`
    const journal = "*Advancing Modern Hardware & Software Journal*"
    const volume = article.volume || "1"
    const issue = article.issue || "1"
    const pages = article.pages || ""
    const doi = article.doi ? `, doi:${article.doi}` : ""
    
    return `${authors} ${title} ${journal}, vol. ${volume}, no. ${issue}, ${year}${pages ? `, pp. ${pages}` : ""}${doi}.`
  }

  private static generateIEEECitation(article: any, authors: string, year: number): string {
    const title = `"${article.title}"`
    const journal = "*Advancing Modern Hardware & Software Journal*"
    const volume = `vol. ${article.volume || "1"}`
    const issue = `no. ${article.issue || "1"}`
    const pages = article.pages ? `, pp. ${article.pages}` : ""
    const doi = article.doi ? `, doi: ${article.doi}` : ""
    
    return `${authors} ${title} ${journal}, ${volume}, ${issue}${pages}, ${year}${doi}.`
  }

  static async generateBibliography(articles: Article[], style: string = 'APA'): Promise<string[]> {
    const citations = await Promise.all(
      articles.map(article => this.generateCitation(article, style))
    )
    
    // Sort alphabetically by first author's last name
    return citations.sort()
  }

  static async exportToBibTeX(article: Article): Promise<string> {
    const authors = article.authors?.map(a => `${a.firstName} ${a.lastName}`).join(' and ') || ""
    const year = new Date(article.publishedAt || article.createdAt).getFullYear()
    const key = `${article.authors?.[0]?.lastName || 'author'}${year}`
    
    return `@article{${key},
  title={${article.title}},
  author={${authors}},
  journal={Advancing Modern Hardware \\& Software Journal},
  volume={${article.volume || "1"}},
  number={${article.issue || "1"}},
  pages={${article.pages || ""}},
  year={${year}},
  publisher={AMHSJ},
  ${article.doi ? `doi={${article.doi}},` : ""}
  url={${process.env.NEXT_PUBLIC_BASE_URL}/article/${article.id}}
}`
  }

  static async exportToRIS(article: Article): Promise<string> {
    const authors = article.authors?.map(a => `AU  - ${a.lastName}, ${a.firstName}`).join('\n') || ""
    const year = new Date(article.publishedAt || article.createdAt).getFullYear()
    
    return `TY  - JOUR
${authors}
TI  - ${article.title}
JO  - Advancing Modern Hardware & Software Journal
VL  - ${article.volume || "1"}
IS  - ${article.issue || "1"}
SP  - ${article.pages ? article.pages.split('-')[0] : ""}
EP  - ${article.pages ? article.pages.split('-')[1] || "" : ""}
PY  - ${year}
PB  - AMHSJ
${article.doi ? `DO  - ${article.doi}` : ""}
UR  - ${process.env.NEXT_PUBLIC_BASE_URL}/article/${article.id}
ER  -`
  }
}
```

#### **Afternoon Tasks (4 hours)**
**File**: `components/citation-generator.tsx` - Citation component

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download, BookOpen } from "lucide-react"
import { CitationService } from "@/lib/citations"

interface CitationGeneratorProps {
  article: {
    id: string
    title: string
    authors: Array<{
      firstName: string
      lastName: string
    }>
    volume?: string
    issue?: string
    pages?: string
    doi?: string
    publishedAt?: string
    createdAt: string
  }
}

export function CitationGenerator({ article }: CitationGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState("APA")
  const [citation, setCitation] = useState("")
  const [loading, setLoading] = useState(false)

  const generateCitation = async (style: string) => {
    setLoading(true)
    try {
      const generated = await CitationService.generateCitation(article, style)
      setCitation(generated)
    } catch (error) {
      console.error("Failed to generate citation:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyCitation = () => {
    navigator.clipboard.writeText(citation)
  }

  const downloadBibTeX = async () => {
    try {
      const bibtex = await CitationService.exportToBibTeX(article)
      const blob = new Blob([bibtex], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.bib`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download BibTeX:", error)
    }
  }

  const downloadRIS = async () => {
    try {
      const ris = await CitationService.exportToRIS(article)
      const blob = new Blob([ris], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.ris`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download RIS:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Cite This Article
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APA">APA</SelectItem>
              <SelectItem value="MLA">MLA</SelectItem>
              <SelectItem value="CHICAGO">Chicago</SelectItem>
              <SelectItem value="IEEE">IEEE</SelectItem>
              <SelectItem value="VANCOUVER">Vancouver</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => generateCitation(selectedStyle)}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Citation"}
          </Button>
        </div>

        {citation && (
          <div className="space-y-2">
            <Textarea 
              value={citation}
              readOnly
              className="min-h-20 text-sm"
            />
            
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={copyCitation}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Citation
              </Button>
              
              <Button size="sm" variant="outline" onClick={downloadBibTeX}>
                <Download className="h-4 w-4 mr-2" />
                BibTeX
              </Button>
              
              <Button size="sm" variant="outline" onClick={downloadRIS}>
                <Download className="h-4 w-4 mr-2" />
                RIS
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### **Day 7: Academic Standards Completion**

#### **Morning Tasks (4 hours)**
**File**: `app/api/citations/generate/route.ts` - Citation API

```typescript
import { NextRequest, NextResponse } from "next/server"
import { CitationService } from "@/lib/citations"
import { db } from "@/lib/db"
import { articles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { articleId, style = 'APA' } = await request.json()

    if (!articleId) {
      return NextResponse.json({ error: "Article ID required" }, { status: 400 })
    }

    // Get article data
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
      with: {
        authors: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Generate citation
    const citation = await CitationService.generateCitation(article, style)

    return NextResponse.json({
      success: true,
      citation,
      style
    })
  } catch (error) {
    console.error('Citation generation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to generate citation" 
    }, { status: 500 })
  }
}
```

#### **Afternoon Tasks (4 hours)**
**File**: `app/admin/academic-standards/page.tsx` - Academic standards dashboard

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

export default function AcademicStandardsPage() {
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState({
    totalArticles: 0,
    doiRegistered: 0,
    orcidVerified: 0,
    plagiarismChecked: 0,
    citationsGenerated: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/academic-standards')
      const data = await response.json()
      setArticles(data.articles)
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch academic standards data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDOIRegistration = async (articleId: string) => {
    try {
      const response = await fetch('/api/integrations/crossref', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      })
      
      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('DOI registration failed:', error)
    }
  }

  const handlePlagiarismCheck = async (articleId: string, content: string) => {
    try {
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleId,
          text: content,
          fileName: `article_${articleId}.txt`
        })
      })
      
      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error('Plagiarism check failed:', error)
    }
  }

  const getComplianceStatus = (article: any) => {
    const checks = [
      article.doi && article.doiRegistered,
      article.plagiarismChecked,
      article.authors?.some((author: any) => author.orcidVerified)
    ]
    
    const passed = checks.filter(Boolean).length
    const total = checks.length
    
    if (passed === total) return { status: 'compliant', color: 'green' }
    if (passed > 0) return { status: 'partial', color: 'yellow' }
    return { status: 'non-compliant', color: 'red' }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading academic standards...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Academic Standards Compliance</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.doiRegistered}</div>
            <div className="text-sm text-gray-600">DOI Registered</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.orcidVerified}</div>
            <div className="text-sm text-gray-600">ORCID Verified</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.plagiarismChecked}</div>
            <div className="text-sm text-gray-600">Plagiarism Checked</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.citationsGenerated}</div>
            <div className="text-sm text-gray-600">Citations Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Article Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>DOI</TableHead>
                <TableHead>Plagiarism</TableHead>
                <TableHead>ORCID</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article: any) => {
                const compliance = getComplianceStatus(article)
                
                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {article.title}
                    </TableCell>
                    
                    <TableCell>
                      {article.doiRegistered ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <a 
                            href={`https://doi.org/${article.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {article.doi}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-gray-500">Not registered</span>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {article.plagiarismChecked ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <Badge className={
                            article.plagiarismScore > 25 ? 'bg-red-100 text-red-800' :
                            article.plagiarismScore > 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {article.plagiarismScore}%
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-gray-500">Not checked</span>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {article.authors?.some((author: any) => author.orcidVerified) ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-gray-500">Not verified</span>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={
                        compliance.color === 'green' ? 'bg-green-100 text-green-800' :
                        compliance.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {compliance.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        {!article.doiRegistered && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDOIRegistration(article.id)}
                          >
                            Register DOI
                          </Button>
                        )}
                        
                        {!article.plagiarismChecked && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePlagiarismCheck(article.id, article.content)}
                          >
                            Check Plagiarism
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🗓️ Week 2: Archive Enhancement & Security Features

### **Day 8: Enhanced Archive Management**

#### **Morning Tasks (4 hours)**
**File**: `lib/archive.ts` - Complete archive service

```typescript
export class ArchiveService {
  static async getVolumeIssues(): Promise<VolumeIssue[]> {
    try {
      const volumes = await db.query.articles.findMany({
        where: eq(articles.status, 'published'),
        columns: {
          volume: true,
          issue: true,
          publishedAt: true
        },
        orderBy: [desc(articles.volume), desc(articles.issue)]
      })

      // Group by volume and issue
      const grouped = volumes.reduce((acc: any, article) => {
        const key = `${article.volume}-${article.issue}`
        if (!acc[key]) {
          acc[key] = {
            volume: article.volume,
            issue: article.issue,
            publishedAt: article.publishedAt,
            articleCount: 0
          }
        }
        acc[key].articleCount++
        return acc
      }, {})

      return Object.values(grouped)
    } catch (error) {
      console.error('Error fetching volume issues:', error)
      throw new Error('Failed to fetch archive structure')
    }
  }

  static async getVolumeContents(volume: string, issue?: string): Promise<ArchiveArticle[]> {
    try {
      const whereConditions = [
        eq(articles.status, 'published'),
        eq(articles.volume, volume)
      ]

      if (issue) {
        whereConditions.push(eq(articles.issue, issue))
      }

      const volumeArticles = await db.query.articles.findMany({
        where: and(...whereConditions),
        with: {
          authors: true
        },
        orderBy: [asc(articles.issue), asc(articles.createdAt)]
      })

      return volumeArticles.map(article => ({
        id: article.id,
        title: article.title,
        authors: article.authors,
        abstract: article.abstract,
        keywords: article.keywords,
        doi: article.doi,
        pages: article.pages,
        publishedAt: article.publishedAt,
        downloadCount: article.downloadCount || 0,
        citationCount: article.citationCount || 0
      }))
    } catch (error) {
      console.error('Error fetching volume contents:', error)
      throw new Error('Failed to fetch volume contents')
    }
  }

  static async generateVolumeIndex(volume: string): Promise<VolumeIndex> {
    try {
      const articles = await this.getVolumeContents(volume)
      
      // Group by issue
      const issues = articles.reduce((acc: any, article) => {
        const issueKey = article.issue || '1'
        if (!acc[issueKey]) {
          acc[issueKey] = []
        }
        acc[issueKey].push(article)
        return acc
      }, {})

      // Generate statistics
      const stats = {
        totalArticles: articles.length,
        totalPages: articles.reduce((sum, article) => {
          const pages = article.pages?.split('-') || []
          const startPage = parseInt(pages[0]) || 0
          const endPage = parseInt(pages[1] || pages[0]) || startPage
          return sum + (endPage - startPage + 1)
        }, 0),
        totalDownloads: articles.reduce((sum, article) => sum + article.downloadCount, 0),
        totalCitations: articles.reduce((sum, article) => sum + article.citationCount, 0),
        subjectAreas: this.extractSubjectAreas(articles),
        authorCount: this.countUniqueAuthors(articles)
      }

      return {
        volume,
        issues,
        stats,
        generatedAt: new Date()
      }
    } catch (error) {
      console.error('Error generating volume index:', error)
      throw new Error('Failed to generate volume index')
    }
  }

  private static extractSubjectAreas(articles: ArchiveArticle[]): string[] {
    const areas = new Set<string>()
    
    articles.forEach(article => {
      if (article.keywords) {
        article.keywords.forEach(keyword => areas.add(keyword))
      }
    })
    
    return Array.from(areas).sort()
  }

  private static countUniqueAuthors(articles: ArchiveArticle[]): number {
    const authors = new Set<string>()
    
    articles.forEach(article => {
      article.authors.forEach(author => {
        authors.add(`${author.firstName} ${author.lastName}`)
      })
    })
    
    return authors.size
  }

  static async searchArchive(query: SearchQuery): Promise<SearchResult[]> {
    try {
      let whereConditions = [eq(articles.status, 'published')]
      
      // Text search
      if (query.text) {
        whereConditions.push(
          or(
            ilike(articles.title, `%${query.text}%`),
            ilike(articles.abstract, `%${query.text}%`),
            sql`${articles.keywords}::text ILIKE ${'%' + query.text + '%'}`
          )
        )
      }

      // Volume filter
      if (query.volume) {
        whereConditions.push(eq(articles.volume, query.volume))
      }

      // Issue filter
      if (query.issue) {
        whereConditions.push(eq(articles.issue, query.issue))
      }

      // Date range filter
      if (query.dateFrom) {
        whereConditions.push(gte(articles.publishedAt, new Date(query.dateFrom)))
      }
      if (query.dateTo) {
        whereConditions.push(lte(articles.publishedAt, new Date(query.dateTo)))
      }

      // Author filter
      if (query.author) {
        // This would require a join with authors table
        // Implementation depends on your schema structure
      }

      const results = await db.query.articles.findMany({
        where: and(...whereConditions),
        with: {
          authors: true
        },
        orderBy: query.sortBy === 'relevance' 
          ? [desc(articles.publishedAt)]
          : query.sortBy === 'date'
          ? [desc(articles.publishedAt)]
          : [asc(articles.title)],
        limit: query.limit || 20,
        offset: query.offset || 0
      })

      return results.map(article => ({
        id: article.id,
        title: article.title,
        authors: article.authors,
        abstract: article.abstract?.substring(0, 200) + '...',
        volume: article.volume,
        issue: article.issue,
        publishedAt: article.publishedAt,
        doi: article.doi,
        relevanceScore: this.calculateRelevance(article, query.text || '')
      }))
    } catch (error) {
      console.error('Archive search error:', error)
      throw new Error('Search failed')
    }
  }

  private static calculateRelevance(article: any, searchText: string): number {
    if (!searchText) return 0
    
    let score = 0
    const text = searchText.toLowerCase()
    
    // Title match (highest weight)
    if (article.title.toLowerCase().includes(text)) {
      score += 10
    }
    
    // Abstract match
    if (article.abstract?.toLowerCase().includes(text)) {
      score += 5
    }
    
    // Keywords match
    if (article.keywords?.some((keyword: string) => 
      keyword.toLowerCase().includes(text)
    )) {
      score += 3
    }
    
    return score
  }
}

export interface VolumeIssue {
  volume: string
  issue: string
  publishedAt: Date
  articleCount: number
}

export interface ArchiveArticle {
  id: string
  title: string
  authors: any[]
  abstract: string
  keywords: string[]
  doi?: string
  pages?: string
  publishedAt: Date
  downloadCount: number
  citationCount: number
}

export interface VolumeIndex {
  volume: string
  issues: Record<string, ArchiveArticle[]>
  stats: {
    totalArticles: number
    totalPages: number
    totalDownloads: number
    totalCitations: number
    subjectAreas: string[]
    authorCount: number
  }
  generatedAt: Date
}

export interface SearchQuery {
  text?: string
  author?: string
  volume?: string
  issue?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'relevance' | 'date' | 'title'
  limit?: number
  offset?: number
}

export interface SearchResult {
  id: string
  title: string
  authors: any[]
  abstract: string
  volume: string
  issue: string
  publishedAt: Date
  doi?: string
  relevanceScore: number
}
```

#### **Afternoon Tasks (4 hours)**
**File**: `app/archive/advanced-search/page.tsx` - Advanced search interface

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Calendar } from "lucide-react"

export default function AdvancedSearchPage() {
  const [searchParams, setSearchParams] = useState({
    text: '',
    author: '',
    volume: '',
    issue: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'relevance'
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/archive/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      })
      
      const data = await response.json()
      setResults(data.results)
      setTotalResults(data.total)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSearchParam = (key: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }))
  }

  const exportResults = async () => {
    try {
      const response = await fetch('/api/archive/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchParams,
          format: 'csv',
          results: results.map(r => r.id)
        })
      })
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'search-results.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Advanced Archive Search</h1>
      
      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="text">Text Search</Label>
              <Input
                id="text"
                placeholder="Search titles, abstracts, keywords..."
                value={searchParams.text}
                onChange={(e) => updateSearchParam('text', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={searchParams.author}
                onChange={(e) => updateSearchParam('author', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="volume">Volume</Label>
              <Select value={searchParams.volume} onValueChange={(value) => updateSearchParam('volume', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any volume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any volume</SelectItem>
                  <SelectItem value="1">Volume 1</SelectItem>
                  <SelectItem value="2">Volume 2</SelectItem>
                  {/* Add more volumes dynamically */}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="issue">Issue</Label>
              <Select value={searchParams.issue} onValueChange={(value) => updateSearchParam('issue', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any issue</SelectItem>
                  <SelectItem value="1">Issue 1</SelectItem>
                  <SelectItem value="2">Issue 2</SelectItem>
                  {/* Add more issues dynamically */}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={searchParams.dateFrom}
                onChange={(e) => updateSearchParam('dateFrom', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={searchParams.dateTo}
                onChange={(e) => updateSearchParam('dateTo', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={searchParams.sortBy} onValueChange={(value) => updateSearchParam('sortBy', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Publication Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1" />
            
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Search Results ({totalResults} found)
              </CardTitle>
              <Button variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result: any) => (
                <div key={result.id} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg mb-2">
                    <a href={`/article/${result.id}`} className="text-blue-600 hover:underline">
                      {result.title}
                    </a>
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {result.authors.map((author: any) => author.name).join(', ')} •{' '}
                    Volume {result.volume}, Issue {result.issue} •{' '}
                    {new Date(result.publishedAt).getFullYear()}
                  </div>
                  
                  <p className="text-gray-700 mb-2">{result.abstract}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {result.doi && (
                      <span>DOI: {result.doi}</span>
                    )}
                    <span>Relevance: {result.relevanceScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

Continue with remaining days...
