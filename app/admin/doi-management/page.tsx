"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Search, Download } from "lucide-react"
import { DOIDisplay } from "@/components/doi-display"
import { toast } from "@/hooks/use-toast"

interface Article {
  id: string
  title: string
  doi?: string
  doiRegistered: boolean
  doiRegisteredAt?: string
  status: string
  volume?: string
  issue?: string
  authors: Array<{ firstName: string; lastName: string }>
  publishedDate?: string
}

export default function DOIManagementPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    withDOI: 0,
    registered: 0,
    pending: 0
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/articles?include_doi=true')
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.articles)
        calculateStats(data.articles)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (articles: Article[]) => {
    const stats = {
      total: articles.length,
      withDOI: articles.filter(a => a.doi).length,
      registered: articles.filter(a => a.doiRegistered).length,
      pending: articles.filter(a => a.doi && !a.doiRegistered).length
    }
    setStats(stats)
  }

  const handleDOIRegistration = async (articleId: string) => {
    try {
      const response = await fetch('/api/integrations/crossref', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "DOI Registered",
          description: `DOI ${result.doi} registered successfully`,
        })
        fetchArticles() // Refresh the list
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register DOI",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during DOI registration",
        variant: "destructive"
      })
    }
  }

  const handleBulkRegistration = async () => {
    const pendingArticles = articles.filter(a => a.status === 'published' && !a.doiRegistered)
    
    if (pendingArticles.length === 0) {
      toast({
        title: "No Articles",
        description: "No published articles pending DOI registration",
      })
      return
    }

    try {
      const promises = pendingArticles.map(article => 
        fetch('/api/integrations/crossref', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId: article.id })
        })
      )

      const results = await Promise.all(promises)
      const successful = results.filter(r => r.ok).length

      toast({
        title: "Bulk Registration Complete",
        description: `${successful} of ${pendingArticles.length} DOIs registered successfully`,
      })

      fetchArticles() // Refresh the list
    } catch (error) {
      toast({
        title: "Bulk Registration Failed",
        description: "An error occurred during bulk DOI registration",
        variant: "destructive"
      })
    }
  }

  const exportDOIReport = async () => {
    try {
      const csvContent = [
        ['Title', 'DOI', 'Status', 'Volume', 'Issue', 'Registered Date', 'Authors'].join(','),
        ...articles.map(article => [
          `"${article.title}"`,
          article.doi || '',
          article.doiRegistered ? 'Registered' : (article.doi ? 'Pending' : 'No DOI'),
          article.volume || '',
          article.issue || '',
          article.doiRegisteredAt ? new Date(article.doiRegisteredAt).toLocaleDateString() : '',
          `"${article.authors.map(a => `${a.firstName} ${a.lastName}`).join('; ')}"`
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `doi-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export DOI report",
        variant: "destructive"
      })
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.authors.some(author => 
        `${author.firstName} ${author.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'registered' && article.doiRegistered) ||
      (statusFilter === 'pending' && article.doi && !article.doiRegistered) ||
      (statusFilter === 'no_doi' && !article.doi)
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="text-lg">Loading DOI management...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">DOI Management</h1>
        <div className="flex space-x-2">
          <Button onClick={handleBulkRegistration} variant="outline">
            Bulk Register DOIs
          </Button>
          <Button onClick={exportDOIReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.withDOI}</div>
            <div className="text-sm text-gray-600">With DOI</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.registered}</div>
            <div className="text-sm text-gray-600">Registered</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Articles</Label>
              <Input
                id="search"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-40 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Articles</option>
                <option value="registered">Registered</option>
                <option value="pending">Pending</option>
                <option value="no_doi">No DOI</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Articles DOI Status ({filteredArticles.length} articles)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Authors</TableHead>
                <TableHead>DOI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Volume/Issue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={article.title}>
                      {article.title}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {article.authors.slice(0, 2).map((author, idx) => (
                        <div key={idx}>{author.firstName} {author.lastName}</div>
                      ))}
                      {article.authors.length > 2 && (
                        <div className="text-gray-500">+{article.authors.length - 2} more</div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {article.doi ? (
                      <DOIDisplay 
                        doi={article.doi} 
                        doiRegistered={article.doiRegistered}
                        title={article.title}
                        className="text-xs"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">Not assigned</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {article.doiRegistered ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Registered
                      </Badge>
                    ) : article.doi ? (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        No DOI
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      Vol. {article.volume || '1'}, Issue {article.issue || '1'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex space-x-2">
                      {!article.doiRegistered && article.status === 'published' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleDOIRegistration(article.id)}
                        >
                          {article.doi ? 'Register DOI' : 'Generate & Register'}
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`/admin/articles/${article.id}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No articles found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
