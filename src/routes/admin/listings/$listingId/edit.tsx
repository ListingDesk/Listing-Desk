import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getUser } from '@netlify/identity'
import { ArrowLeft } from 'lucide-react'
import { ListingForm, type ListingFormData } from '@/components/ListingForm'

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
}

export const Route = createFileRoute('/admin/listings/$listingId/edit')({
  component: EditListingPage,
})

function EditListingPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/listings/${listingId}`)
      .then(r => r.json())
      .then(setListing)
      .finally(() => setLoading(false))
  }, [listingId])

  const handleSubmit = async (data: ListingFormData) => {
    setSaving(true)
    setError('')
    try {
      const user = await getUser()
      const token = user?.token?.access_token
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())
      navigate({ to: '/admin' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-400">Loading…</div>
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Listing not found</p>
        <Link to="/admin" className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
      </div>
    )
  }

  const defaultValues: ListingFormData = {
    title: listing.title,
    description: listing.description,
    category: listing.category,
    price: listing.price !== null ? String(listing.price) : '',
    location: listing.location,
    contactName: listing.contactName,
    contactEmail: listing.contactEmail,
    contactPhone: listing.contactPhone,
    imageUrl: listing.imageUrl,
    status: listing.status,
    featured: listing.featured,
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <ListingForm onSubmit={handleSubmit} saving={saving} submitLabel="Save Changes" defaultValues={defaultValues} />
    </div>
  )
}
