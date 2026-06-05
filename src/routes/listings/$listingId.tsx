import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Phone, Mail, Tag, Star, Calendar, Share2, CheckCircle } from 'lucide-react'

type Listing = {
  id: number
  title: string
  description: string
  category: string
  price: number | null
  location: string
  contactName: string
  contactEmail: string
  contactPhone: string
  imageUrl: string
  status: string
  featured: boolean
  createdAt: string
}

export const Route = createFileRoute('/listings/$listingId')({
  component: ListingDetailPage,
})

function formatPrice(price: number | null) {
  if (price === null) return 'Contact for price'
  if (price === 0) return 'Free'
  return `$${(price / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ListingDetailPage() {
  const { listingId } = Route.useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/listings/${listingId}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(data => { if (data) setListing(data) })
      .finally(() => setLoading(false))
  }, [listingId])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-lg">Listing not found</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-indigo-600 hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Image */}
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Tag className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Title & meta */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{listing.category}</span>
                {listing.featured && (
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
                {listing.status !== 'active' && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full capitalize">{listing.status}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{listing.title}</h1>
            </div>
            <button
              onClick={handleShare}
              className="shrink-0 p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              title="Copy link"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-6">
            {listing.location && (
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{listing.location}</span>
            )}
            {listing.createdAt && (
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Listed {formatDate(listing.createdAt)}</span>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-indigo-600 mb-1">{formatPrice(listing.price)}</div>
            {listing.status !== 'active' && (
              <p className="text-sm text-orange-600 font-medium capitalize mb-2">Status: {listing.status}</p>
            )}
          </div>

          {/* Contact card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Seller</h3>
            {listing.contactName && (
              <p className="text-sm text-gray-700 font-medium mb-3">{listing.contactName}</p>
            )}
            {listing.contactPhone && (
              <a
                href={`tel:${listing.contactPhone}`}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-2"
              >
                <Phone className="w-4 h-4" /> {listing.contactPhone}
              </a>
            )}
            {listing.contactEmail && (
              <a
                href={`mailto:${listing.contactEmail}?subject=Re: ${encodeURIComponent(listing.title)}`}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
              >
                <Mail className="w-4 h-4" /> {listing.contactEmail}
              </a>
            )}
            {!listing.contactPhone && !listing.contactEmail && (
              <p className="text-sm text-gray-400">No contact details provided</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
