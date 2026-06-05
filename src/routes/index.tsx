import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, Tag, Star, ChevronRight } from 'lucide-react'

type Listing = {
  id: number
  title: string
  description: string
  category: string
  price: number | null
  location: string
  contactName: string
  imageUrl: string
  status: string
  featured: boolean
  createdAt: string
}

const CATEGORIES = ['All', 'general', 'vehicles', 'real-estate', 'electronics', 'furniture', 'clothing', 'services', 'jobs', 'other']

export const Route = createFileRoute('/')({
  component: BrowsePage,
})

function formatPrice(price: number | null) {
  if (price === null) return 'Contact for price'
  if (price === 0) return 'Free'
  return `$${(price / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (category !== 'All') params.set('category', category)
    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    setListings(data)
    setLoading(false)
  }, [query, category])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(search)
  }

  const featured = listings.filter(l => l.featured)
  const regular = listings.filter(l => !l.featured)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero search */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Find What You're Looking For</h1>
        <p className="text-gray-500 mb-6">Browse local listings from verified sellers</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search listings…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-sm mt-1">Try adjusting your search or category</p>
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-4 flex items-center gap-1">
                <Star className="w-4 h-4" /> Featured
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map(listing => <ListingCard key={listing.id} listing={listing} featured />)}
              </div>
            </section>
          )}

          {regular.length > 0 && (
            <section>
              {featured.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">All Listings</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {regular.map(listing => <ListingCard key={listing.id} listing={listing} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function ListingCard({ listing, featured }: { listing: Listing; featured?: boolean }) {
  return (
    <Link
      to="/listings/$listingId"
      params={{ listingId: listing.id.toString() }}
      className={`group bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${
        featured ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200'
      }`}
    >
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Tag className="w-12 h-12" />
          </div>
        )}
        {featured && (
          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Star className="w-3 h-3" /> Featured
          </span>
        )}
        <span className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full capitalize">
          {listing.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{listing.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">{formatPrice(listing.price)}</span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {listing.location && <><MapPin className="w-3 h-3" />{listing.location}</>}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{listing.contactName || 'Anonymous'}</span>
          <span className="flex items-center gap-0.5 text-indigo-500 font-medium">
            View <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
