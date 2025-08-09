"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  History,
  Save,
  Download,
  Eye,
  Zap,
  Clock
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface SearchFilters {
  query?: string
  category?: string
  authors?: string[]
  keywords?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  volume?: string
  issue?: string
  status?: string
  hasFullText?: boolean
  hasPDF?: boolean
  citationCountMin?: number
  viewCountMin?: number
  downloadCountMin?: number
  sortBy?: 'relevance' | 'date' | 'citations' | 'views' | 'downloads' | 'title'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

interface SearchSuggestion {
  type: 'title' | 'author' | 'keyword' | 'category'
  value: string
  count: number
}

interface SearchResult {
  id: string
  title: string
  abstract: string
  authors: string[]
  keywords: string[]
  category: string
  volume: string
  issue: string
  pages: string
  publishedDate: string
  doi?: string
  pdfUrl?: string
  viewCount: number
  downloadCount: number
  citationCount: number
  relevanceScore: number
  highlightedTitle?: string
  highlightedAbstract?: string
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
  totalPages: number
  aggregations: {
    categories: Record<string, number>
    authors: Record<string, number>
    keywords: Record<string, number>
    years: Record<string, number>
    volumes: Record<string, number>
  }
  suggestions: SearchSuggestion[]
  executionTime: number
}

export default function AdvancedSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  })
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [popularSearches, setPopularSearches] = useState<Array<{ query: string; count: number }>>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [savedSearches, setSavedSearches] = useState([])
  
  // Debounced search query for suggestions
  const debouncedQuery = useDebounce(searchQuery, 300)
  
  // References
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery)
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery])

  useEffect(() => {
    fetchPopularSearches()
  }, [])

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/search?action=suggestions&q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
    }
  }

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch("/api/search?action=popular&limit=10")
      const data = await response.json()
      
      if (data.success) {
        setPopularSearches(data.popularSearches)
      }
    } catch (error) {
      console.error("Failed to fetch popular searches:", error)
    }
  }

  const performSearch = useCallback(async (searchFilters?: Partial<SearchFilters>) => {
    setLoading(true)
    
    try {
      const finalFilters = { ...filters, ...searchFilters, query: searchQuery }
      
      const params = new URLSearchParams()
      
      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else if (typeof value === 'object' && value.start && value.end) {
            params.set('startDate', value.start.toISOString())
            params.set('endDate', value.end.toISOString())
          } else {
            params.set(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/search?action=search&${params}`)
      const data = await response.json()

      if (data.success) {
        setSearchResults(data.data)
        setSuggestions([]) // Clear suggestions after search
      } else {
        toast({
          title: "Search Error",
          description: data.error || "Search failed",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search Error",
        description: "Failed to perform search",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch()
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value)
    setSuggestions([])
    setTimeout(() => performSearch(), 100)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 } // Reset to page 1 when filters change
    setFilters(newFilters)
    
    if (searchQuery) {
      performSearch(newFilters)
    }
  }

  const clearFilters = () => {
    setFilters({
      sortBy: 'relevance',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    })
    if (searchQuery) {
      performSearch({
        sortBy: 'relevance',
        sortOrder: 'desc',
        page: 1,
        limit: 20
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    performSearch(newFilters)
  }

  const saveSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please enter a search query first",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-search",
          query: searchQuery,
          filters,
          name: `Search: ${searchQuery}`
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Search Saved",
          description: "Your search has been saved successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save search",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Advanced Search</h1>
          <p className="text-gray-600">Find exactly what you're looking for with powerful search filters</p>
        </div>

        {/* Search Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search Articles
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                <Button variant="outline" size="sm" onClick={saveSearch}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Main Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search articles, authors, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 text-lg py-3"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  disabled={loading}
                >
                  {loading ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <Card 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto"
                >
                  <CardContent className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center">
                          {suggestion.type === 'author' && <User className="h-4 w-4 mr-2 text-blue-500" />}
                          {suggestion.type === 'keyword' && <Badge variant="secondary" className="mr-2 text-xs">K</Badge>}
                          {suggestion.type === 'category' && <BookOpen className="h-4 w-4 mr-2 text-green-500" />}
                          {suggestion.type === 'title' && <Search className="h-4 w-4 mr-2 text-purple-500" />}
                          <span>{suggestion.value}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.count}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </form>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Advanced Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={filters.category || ""} 
                      onValueChange={(value) => handleFilterChange('category', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {searchResults?.aggregations.categories && 
                          Object.entries(searchResults.aggregations.categories).map(([category, count]) => (
                            <SelectItem key={category} value={category}>
                              {category} ({count})
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Filter */}
                  <div className="space-y-2">
                    <Label>Publication Year</Label>
                    <Select 
                      value={filters.dateRange ? filters.dateRange.start.getFullYear().toString() : ""} 
                      onValueChange={(value) => {
                        if (value) {
                          const year = parseInt(value)
                          handleFilterChange('dateRange', {
                            start: new Date(year, 0, 1),
                            end: new Date(year, 11, 31)
                          })
                        } else {
                          handleFilterChange('dateRange', undefined)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Years</SelectItem>
                        {searchResults?.aggregations.years && 
                          Object.entries(searchResults.aggregations.years)
                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                            .map(([year, count]) => (
                              <SelectItem key={year} value={year}>
                                {year} ({count})
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Volume Filter */}
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Select 
                      value={filters.volume || ""} 
                      onValueChange={(value) => handleFilterChange('volume', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Volumes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Volumes</SelectItem>
                        {searchResults?.aggregations.volumes && 
                          Object.entries(searchResults.aggregations.volumes).map(([volume, count]) => (
                            <SelectItem key={volume} value={volume}>
                              Volume {volume} ({count})
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <h4 className="font-medium">Advanced Options</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Content Type Filters */}
                    <div className="space-y-3">
                      <Label>Content Requirements</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasFullText"
                            checked={filters.hasFullText || false}
                            onCheckedChange={(checked) => handleFilterChange('hasFullText', checked)}
                          />
                          <Label htmlFor="hasFullText" className="text-sm">
                            Has full text
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasPDF"
                            checked={filters.hasPDF || false}
                            onCheckedChange={(checked) => handleFilterChange('hasPDF', checked)}
                          />
                          <Label htmlFor="hasPDF" className="text-sm">
                            PDF available
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="space-y-3">
                      <Label>Sort By</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select 
                          value={filters.sortBy || "relevance"} 
                          onValueChange={(value) => handleFilterChange('sortBy', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="citations">Citations</SelectItem>
                            <SelectItem value="views">Views</SelectItem>
                            <SelectItem value="downloads">Downloads</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select 
                          value={filters.sortOrder || "desc"} 
                          onValueChange={(value) => handleFilterChange('sortOrder', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">Descending</SelectItem>
                            <SelectItem value="asc">Ascending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Citation/View Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Citations: {filters.citationCountMin || 0}</Label>
                      <Slider
                        value={[filters.citationCountMin || 0]}
                        onValueChange={([value]) => handleFilterChange('citationCountMin', value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Views: {filters.viewCountMin || 0}</Label>
                      <Slider
                        value={[filters.viewCountMin || 0]}
                        onValueChange={([value]) => handleFilterChange('viewCountMin', value)}
                        max={10000}
                        step={100}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Downloads: {filters.downloadCountMin || 0}</Label>
                      <Slider
                        value={[filters.downloadCountMin || 0]}
                        onValueChange={([value]) => handleFilterChange('downloadCountMin', value)}
                        max={5000}
                        step={50}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results or Welcome Content */}
        {searchResults ? (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                Found {searchResults.total.toLocaleString()} articles
                {searchQuery && ` for "${searchQuery}"`}
                <span className="text-gray-400 ml-2">
                  ({searchResults.executionTime}ms)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-4">
              {searchResults.results.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800">{article.category}</Badge>
                          <span className="text-sm text-gray-500">
                            Vol. {article.volume}, No. {article.issue}
                          </span>
                          {article.pages && (
                            <span className="text-sm text-gray-500">
                              pp. {article.pages}
                            </span>
                          )}
                          <div className="flex items-center text-sm text-amber-600">
                            <Zap className="h-3 w-3 mr-1" />
                            {article.relevanceScore.toFixed(1)}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-semibold hover:text-blue-600 cursor-pointer mb-2">
                          <Link href={`/article/${article.id}`}>
                            <span dangerouslySetInnerHTML={{ 
                              __html: article.highlightedTitle || article.title 
                            }} />
                          </Link>
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <User className="h-4 w-4 mr-1" />
                          {article.authors.join(", ")}
                        </div>
                        
                        <div className="flex items-center text-gray-500 mb-3">
                          <Calendar className="h-4 w-4 mr-1" />
                          Published: {new Date(article.publishedDate).toLocaleDateString()}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">
                          <span dangerouslySetInnerHTML={{ 
                            __html: article.highlightedAbstract || article.abstract.substring(0, 300) + '...'
                          }} />
                        </p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.keywords.slice(0, 5).map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {article.keywords.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.keywords.length - 5} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {article.doi && (
                              <>
                                <span className="font-medium">DOI:</span> {article.doi}
                              </>
                            )}
                          </div>
                          <div className="flex gap-4">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/article/${article.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Article
                              </Link>
                            </Button>
                            {article.pdfUrl && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                                <Link href={article.pdfUrl} target="_blank">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download PDF
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-sm text-gray-500 ml-6">
                        <div className="flex items-center mb-1">
                          <Eye className="h-4 w-4 mr-1" />
                          {article.viewCount.toLocaleString()}
                        </div>
                        <div className="flex items-center mb-1">
                          <Download className="h-4 w-4 mr-1" />
                          {article.downloadCount.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {article.citationCount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {searchResults.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    disabled={searchResults.page === 1}
                    onClick={() => handlePageChange(searchResults.page - 1)}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(searchResults.totalPages, 5) }, (_, i) => {
                    const page = i + Math.max(1, searchResults.page - 2)
                    return (
                      <Button
                        key={page}
                        variant={searchResults.page === page ? 'default' : 'outline'}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                  
                  <Button 
                    variant="outline" 
                    disabled={searchResults.page === searchResults.totalPages}
                    onClick={() => handlePageChange(searchResults.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Welcome Content */
          <div className="space-y-8">
            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Popular Searches
                </CardTitle>
                <CardDescription>
                  See what other researchers are searching for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Button
                      key={search.query}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(search.query)
                        setTimeout(() => performSearch(), 100)
                      }}
                      className="hover:bg-blue-50"
                    >
                      {search.query}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {search.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Search Tips</CardTitle>
                <CardDescription>
                  Get the most out of your search experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Basic Search</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use quotation marks for exact phrases</li>
                      <li>• Use AND, OR for multiple terms</li>
                      <li>• Use wildcard * for partial matches</li>
                      <li>• Search by author names, titles, or keywords</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Advanced Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Filter by publication year or category</li>
                      <li>• Sort by relevance, citations, or date</li>
                      <li>• Set minimum citation/view thresholds</li>
                      <li>• Save searches for future reference</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
