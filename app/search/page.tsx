import { Metadata } from 'next'
import AdvancedSearchPage from '@/components/advanced-search'

export const metadata: Metadata = {
  title: 'Advanced Search | Academic Journal',
  description: 'Search through our collection of academic articles with advanced filtering and sorting options. Find exactly what you\'re looking for.',
  keywords: ['academic search', 'research articles', 'scholarly publications', 'advanced search', 'filters'],
  openGraph: {
    title: 'Advanced Search | Academic Journal',
    description: 'Search through our collection of academic articles with advanced filtering and sorting options.',
    type: 'website',
  },
}

export default function Page() {
  return <AdvancedSearchPage />
}
