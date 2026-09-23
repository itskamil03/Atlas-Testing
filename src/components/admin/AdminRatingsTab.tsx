"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Star, Upload, Trash2, Edit3, Plus, RotateCcw, CheckCircle, ShieldCheck, Image as ImageIcon } from "lucide-react"
import {
  getStoredIndianRatings,
  saveStoredIndianRatings,
  INITIAL_INDIAN_RATINGS,
  type IndianRatingItem,
} from "@/lib/indianRatingsStore"

interface AdminRatingsTabProps {
  onMessage?: (msg: string) => void
}

const emptyItem: Omit<IndianRatingItem, "id"> = {
  name: "",
  role: "Delta Exchange Trader • Mumbai",
  quote: "",
  rating: 5,
  screenshotUrl: "",
  date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  verified: true,
  isFeatured: true,
}

export function AdminRatingsTab({ onMessage }: AdminRatingsTabProps) {
  const [ratings, setRatings] = useState<IndianRatingItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<IndianRatingItem, "id">>(emptyItem)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRatings(getStoredIndianRatings())
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setFormData((prev) => ({ ...prev, screenshotUrl: result }))
        onMessage?.("Screenshot uploaded successfully!")
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.quote.trim()) {
      onMessage?.("Please enter trader name and review text.")
      return
    }

    if (!formData.screenshotUrl) {
      onMessage?.("Please upload or provide a screenshot image.")
      return
    }

    let updated: IndianRatingItem[]
    if (editingId) {
      updated = ratings.map((item) => (item.id === editingId ? { ...formData, id: editingId } : item))
      onMessage?.("Rating & review updated successfully!")
    } else {
      const newItem: IndianRatingItem = {
        ...formData,
        id: `rating-${Date.now()}`,
      }
      updated = [newItem, ...ratings]
      onMessage?.("New rating & review published!")
    }

    setRatings(updated)
    saveStoredIndianRatings(updated)
    setEditingId(null)
    setFormData(emptyItem)
  }

  const handleEdit = (item: IndianRatingItem) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      role: item.role,
      quote: item.quote,
      rating: item.rating,
      screenshotUrl: item.screenshotUrl,
      date: item.date,
      verified: item.verified,
      isFeatured: item.isFeatured,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      const updated = ratings.filter((item) => item.id !== id)
      setRatings(updated)
      saveStoredIndianRatings(updated)
      onMessage?.("Rating deleted.")
    }
  }

  const handleResetDefaults = () => {
    if (window.confirm("Reset all ratings to default presets?")) {
      setRatings(INITIAL_INDIAN_RATINGS)
      saveStoredIndianRatings(INITIAL_INDIAN_RATINGS)
      onMessage?.("Ratings reset to default presets.")
    }
  }

  return (
    <section className="mt-5 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        {/* Form to Add / Edit Review */}
        <div className="rounded-2xl border border-[#1E2A39] bg-[#0D1725]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2A39]">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? "Edit Indian Rating & Review" : "Add New Indian Rating & Screenshot"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData(emptyItem)
                }}
                className="text-xs text-[#8EA8C7] hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            {/* Trader Name & Role */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-[#8EA8C7] block mb-1">Trader Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-[#8EA8C7] block mb-1">Market & Location *</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Delta Exchange Trader • Mumbai"
                  className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Rating Stars Selector */}
            <div>
              <label className="text-xs text-[#8EA8C7] block mb-1">Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#0F1B2B] border border-[#2A3B50] rounded-lg p-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`size-5 ${
                          star <= formData.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-[#2A3B50] fill-transparent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-semibold text-white">{formData.rating} Stars</span>
              </div>
            </div>

            {/* Review / Testimonial Text */}
            <div>
              <label className="text-xs text-[#8EA8C7] block mb-1">Review / Testimonial Text *</label>
              <textarea
                required
                rows={3}
                value={formData.quote}
                onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                placeholder="Describe the trade results, signals accuracy, PnL, or experience with ATLAS..."
                className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Screenshot Upload & Preview */}
            <div>
              <label className="text-xs text-[#8EA8C7] block mb-1">P&amp;L Screenshot / Proof Image *</label>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg bg-[#182638] border border-[#2A3B50] px-4 py-2 text-xs font-semibold text-white hover:border-purple-500 hover:bg-purple-600/20 transition-all cursor-pointer"
                  >
                    <Upload className="size-4 text-purple-400" />
                    <span>Upload Screenshot File</span>
                  </button>

                  <input
                    type="text"
                    value={formData.screenshotUrl.startsWith("data:") ? "[Uploaded Image File]" : formData.screenshotUrl}
                    onChange={(e) => {
                      if (!e.target.value.startsWith("[Uploaded")) {
                        setFormData((prev) => ({ ...prev, screenshotUrl: e.target.value }))
                      }
                    }}
                    placeholder="or paste Image URL"
                    className="flex-1 rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Live Screenshot Preview */}
                {formData.screenshotUrl ? (
                  <div className="relative aspect-[16/9] w-full max-w-sm overflow-hidden rounded-xl border border-[#2A3B50] bg-slate-950">
                    {formData.screenshotUrl.startsWith("data:image/svg") ? (
                      <img
                        src={formData.screenshotUrl}
                        alt="Screenshot Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Image
                        src={formData.screenshotUrl}
                        alt="Screenshot Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full max-w-sm items-center justify-center rounded-xl border border-dashed border-[#2A3B50] bg-[#0F1B2B]/40 text-[#64748B]">
                    <div className="text-center p-4">
                      <ImageIcon className="size-8 mx-auto mb-1 opacity-40" />
                      <p className="text-xs">No screenshot selected yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verified Badge & Date */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs text-[#8EA8C7] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData((prev) => ({ ...prev, verified: e.target.checked }))}
                  className="rounded border-[#2A3B50] bg-[#0F1B2B] text-purple-600 focus:ring-0"
                />
                <span>Verified Buyer / Trader Badge</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-xs text-[#8EA8C7]">Date:</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-28 rounded border border-[#2A3B50] bg-[#0F1B2B] px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-purple-600/20 active:scale-95"
              >
                <Plus className="size-4" />
                <span>{editingId ? "Update Rating & Screenshot" : "Publish to Indian Rating"}</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData(emptyItem)
                  }}
                  className="rounded-xl border border-[#2A3B50] bg-transparent text-[#8EA8C7] hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Ratings List & Previews */}
        <div className="rounded-2xl border border-[#1E2A39] bg-[#0D1725]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2A39]">
            <div>
              <h3 className="text-lg font-semibold text-white">Active Ratings &amp; Reviews</h3>
              <p className="text-xs text-[#8EA8C7]">
                These reviews and screenshots appear in the Indian Rating section on the homepage.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="Reset to default reviews"
              className="flex items-center gap-1.5 rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-2.5 py-1.5 text-xs text-[#8EA8C7] hover:text-white hover:border-purple-500 transition-colors"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {ratings.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 rounded-xl border border-[#1E2A39] bg-[#0F1B2B]/70 p-4 transition-all hover:border-purple-500/40"
              >
                {/* Screenshot Thumbnail */}
                <div className="relative aspect-[16/10] w-full sm:w-36 shrink-0 overflow-hidden rounded-lg border border-[#2A3B50] bg-slate-950">
                  {item.screenshotUrl.startsWith("data:image/svg") ? (
                    <img
                      src={item.screenshotUrl}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Image
                      src={item.screenshotUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-white text-sm">{item.name}</p>
                        {item.verified && (
                          <span title="Verified Trader">
                            <ShieldCheck className="size-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-[#8EA8C7] mt-0.5">{item.role}</p>
                    <p className="text-xs text-[#C9D4E0] mt-2 line-clamp-2 italic">&ldquo;{item.quote}&rdquo;</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#1E2A39] pt-2">
                    <span className="text-[11px] text-[#64748B]">{item.date}</span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1 rounded-md border border-[#2A3B50] bg-[#182638] px-2.5 py-1 text-xs text-[#C9D4E0] hover:text-white hover:border-purple-500 transition-colors"
                      >
                        <Edit3 className="size-3 text-purple-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="size-3 text-red-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
