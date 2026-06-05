import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { getUser, logout } from '@netlify/identity'
import { Plus, Edit, Trash2, Star, Eye, EyeOff, LogOut, Tag } from 'lucide-react'

type Listing = {
  id: number
  title: string
  category: string
  price: number | null
  location: string
  status: string
  featured: boolean
  createdAt: string
}

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function formatPrice(price: number | null) {
  if (price === null) return '—'
  if (price === 0) return 'Free'
  return `$${(price / 100).toLocaleString()}`
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    getUser().then(u => { if (u) setUserEmail(u.email) })
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/listings?all=true')
    setListings(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/admin/login' })
  }

  const getAuthHeader = async () => {
    const user = await getUser()
    const token = user?.token?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const toggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'sold' : 'active'
    const headers = await getAuthHeader()
    await fetch(`/api/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchListings()
  }

  const toggleFeatured = async (listing: Listing) => {
    const headers = await getAuthHeader()
    await fetch(`/api/listings/${listing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ featured: !listing.featured }),
    })
    fetchListings()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeletingId(id)
    const headers = await getAuthHeader()
    await fetch(`/api/listings/${id}`, { method: 'DELETE', headers })
    setDeletingId(null)
    fetchListings()
  }

  const active = listings.filter(l => l.status === 'active').length
  const sold = listings.filter(l => l.status === 'sold').length
  const featured = listings.filter(l => l.featured).length
  const unposted = listings.filter(l => l.status === 'unposted').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{userEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/listings/new"
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Listing
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: listings.length, color: 'text-gray-900' },
          { label: 'Active', value: active, color: 'text-green-600' },
          { label: 'Featured', value: featured, color: 'text-indigo-600' },
          { label: 'Unposted', value: unposted, color: 'text-amber-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : listings.length === 0 ? (
          <div className="p-16 text-center">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No listings yet</p>
            <Link
              to="/admin/listings/new"
              className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
            >
              <Plus className="w-4 h-4" /> Create your first listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map(listing => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{listing.title}</span>
                        {listing.featured && <Star className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                      </div>
                      {listing.location && <div className="text-xs text-gray-400">{listing.location}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{listing.category}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(listing.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        listing.status === 'active' ? 'bg-green-100 text-green-700' :
                        listing.status === 'sold' ? 'bg-orange-100 text-orange-700' :
                        listing.status === 'unposted' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleFeatured(listing)}
                          title={listing.featured ? 'Remove featured' : 'Mark as featured'}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${listing.featured ? 'text-indigo-500' : 'text-gray-400'}`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(listing)}
                          title={listing.status === 'active' ? 'Mark as sold' : 'Mark as active'}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                          {listing.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          to="/admin/listings/$listingId/edit"
                          params={{ listingId: listing.id.toString() }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
