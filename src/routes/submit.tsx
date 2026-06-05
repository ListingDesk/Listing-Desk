import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Upload,
  CheckCircle,
  Loader2,
  Camera,
  X,
  Car,
  Waves,
  Wrench,
  Shield,
  Monitor,
  Package,
} from 'lucide-react'

export const Route = createFileRoute('/submit')({
  component: SubmitListingPage,
})

const CATEGORIES = [
  { id: 'vehicles', label: 'Cars, Trucks & Trailers', Icon: Car },
  { id: 'marine', label: 'Boats & Watercraft', Icon: Waves },
  { id: 'heavy_equipment', label: 'Heavy Equipment & Industrial', Icon: Wrench },
  { id: 'surplus_gear', label: 'Govt Surplus & Tactical Gear', Icon: Shield },
  { id: 'electronics', label: 'Electronics & Body Cams', Icon: Monitor },
  { id: 'other', label: 'General Merchandise / Other', Icon: Package },
] as const

const CONDITIONS = ['New', 'Excellent', 'Good', 'Fair', 'Salvage / For Parts']

type CategoryId = (typeof CATEGORIES)[number]['id']

type FormState = {
  category: CategoryId | ''
  title: string
  price: string
  condition: string
  location: string
  description: string
  contactName: string
  contactEmail: string
  contactPhone: string
  vin: string
  mileage: string
  hoursUsed: string
  hullId: string
}

const EMPTY: FormState = {
  category: '',
  title: '',
  price: '',
  condition: '',
  location: '',
  description: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  vin: '',
  mileage: '',
  hoursUsed: '',
  hullId: '',
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Upload failed')
  }
  const { url } = await res.json()
  return url as string
}

function SubmitListingPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving' | 'done'>('idle')
  const [uploadMsg, setUploadMsg] = useState('')
  const [error, setError] = useState('')

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) { setError('Please select an asset category.'); return }
    setError('')
    setPhase('uploading')

    const imageUrls: string[] = []
    try {
      for (let i = 0; i < images.length; i++) {
        setUploadMsg(`Uploading photo ${i + 1} of ${images.length}…`)
        const url = await uploadFile(images[i])
        imageUrls.push(url)
      }

      setPhase('saving')
      setUploadMsg('Saving submission…')

      const payload = {
        title: form.title,
        category: form.category,
        price: form.price,
        condition: form.condition,
        location: form.location,
        description: form.description,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        imageUrls,
        metadata: {
          vin: form.vin || undefined,
          mileage: form.mileage || undefined,
          hours: form.hoursUsed || undefined,
          hullId: form.hullId || undefined,
        },
      }

      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())

      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setPhase('idle')
    }
  }

  const reset = () => {
    setForm(EMPTY)
    setImages([])
    setPreviews([])
    setPhase('idle')
    setError('')
    setUploadMsg('')
  }

  if (phase === 'done') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your item and photos have been sent to our intake desk. A team member will review the listing
            and reach out if they need anything additional.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Submit Another Item
          </button>
        </div>
      </div>
    )
  }

  const busy = phase === 'uploading' || phase === 'saving'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit an Item for Listing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below and upload photos. Our team reviews every submission before it goes live.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 flex items-start gap-2">
          <X className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Asset Category *</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, category: id }))}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors text-center ${
                  form.category === id
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700 ring-1 ring-indigo-300'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Core details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Item Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title / Model Name *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              required
              placeholder="e.g. 2014 Ford F-250 Super Duty or L3Harris Body Camera"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asking Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set('price')}
                placeholder="Leave blank = contact for price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={set('condition')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select --</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category-specific fields */}
          {form.category === 'vehicles' && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">Mileage</label>
                <input
                  type="text"
                  value={form.mileage}
                  onChange={set('mileage')}
                  placeholder="e.g. 142,000"
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">VIN</label>
                <input
                  type="text"
                  value={form.vin}
                  onChange={set('vin')}
                  placeholder="17-digit VIN"
                  maxLength={17}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
            </div>
          )}

          {form.category === 'heavy_equipment' && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <label className="block text-xs font-medium text-amber-700 mb-1">
                Operational Hours
              </label>
              <input
                type="text"
                value={form.hoursUsed}
                onChange={set('hoursUsed')}
                placeholder="e.g. 3,450 hrs"
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>
          )}

          {form.category === 'marine' && (
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <label className="block text-xs font-medium text-cyan-700 mb-1">Hull ID (HIN)</label>
              <input
                type="text"
                value={form.hullId}
                onChange={set('hullId')}
                placeholder="12-character Hull Identification Number"
                className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location / Storage Site
            </label>
            <input
              type="text"
              value={form.location}
              onChange={set('location')}
              placeholder="e.g. North Warehouse Bay 4 or Austin, TX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description & Disclosures
            </label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={4}
              placeholder="List inclusions, known defects, serial numbers, accessories, or anything a buyer should know…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Your Contact Info</h2>
          <p className="text-xs text-gray-400 -mt-2">
            Only used for our team to follow up — never shared publicly.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.contactName}
              onChange={set('contactName')}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={set('contactEmail')}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={set('contactPhone')}
                placeholder="+1 555 000 0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Photos</h2>
          <p className="text-xs text-gray-400 mb-3">
            Upload up to 10 photos. JPEG, PNG, WEBP, or HEIC. Max 10 MB each.
          </p>

          <label className="flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors text-center">
            <Camera className="w-7 h-7 text-gray-400" />
            <span className="text-sm text-gray-500">
              Tap to select photos
            </span>
            <span className="text-xs text-gray-400">or drag and drop</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFiles}
              className="sr-only"
            />
          </label>

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <p className="mt-2 text-xs text-indigo-600 font-medium">
              {images.length} photo{images.length !== 1 ? 's' : ''} ready to upload
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadMsg}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Submit for Review
            </>
          )}
        </button>
      </form>
    </div>
  )
}
